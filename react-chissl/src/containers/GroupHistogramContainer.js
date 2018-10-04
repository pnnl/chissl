
/* 
  BSD License:
  
  CHISSL: Interactive Machine Learning
  
  Copyright © 2018, Battelle Memorial Institute
  
  All rights reserved.
  
  1. Battelle Memorial Institute (hereinafter Battelle) hereby grants permission
     to any person or entity lawfully obtaining a copy of this software and
     associated documentation files (hereinafter “the Software”) to redistribute
     and use the Software in source and binary forms, with or without 
     modification.  Such person or entity may use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software, and may permit
     others to do so, subject to the following conditions:
     * Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimers.
     * Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
     * Other than as used herein, neither the name Battelle Memorial Institute
       or Battelle may be used in any form whatsoever without the express
       written consent of Battelle. 
  
  2. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
     THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
     PURPOSEARE DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS BE LIABLE
     FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
     DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
     CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
     LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
     OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
     DAMAGE.
     
*/

import React from 'react';
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Map, Set} from 'immutable';

import Select from 'react-select'
import 'react-select/dist/react-select.min.css'

import {nest} from 'd3-collection'
import {max, extent, histogram, merge} from 'd3-array';
import {scaleLinear, scaleTime} from 'd3-scale';
import {format} from 'd3-format';

import {createSetHistogramNameAction} from '../actions/ui'

import {FlexibleWidthXYPlot, XAxis, YAxis, VerticalBarSeries} from 'react-vis';
import 'react-vis/dist/style.css';

import {getPredictions, getDendrogram, getNestedDataFromLabels} from '../selectors';

import {createShowMoreAction} from '../actions/ui';
import {getModelPath} from '../actions/api'

const getHistogramData = createSelector(
  [ state => state.getIn(getModelPath('hist')) ],
  data => data.map(series => {
    const test = series[0];
    
    const xType = typeof(test);

    if (xType === 'string') {
      return test.length < 7 || isNaN(new Date(test))
        ? {series, xType: 'ordinal'}
        : {series: series.map(d => new Date(d)), xType: 'time'};
    }

    return {series, xType: 'linear'};
  })
);

export const getHistogramSelectProps = createSelector(
  [ getHistogramData,
    state => state.getIn(['ui', 'histogram', 'name'], '')
  ],
  (data, value) => {
    const options = data
      .keySeq()
      .map(value => ({value, label: value}))
      .toArray();

    if (value === '' && options.length > 0) {
      value = options[0].value;
    }

    return {
      options, value,
      simpleValue: true
    };
  }
);

export const GroupHistogramSelect = connect(
  getHistogramSelectProps,
  dispatch => bindActionCreators({
    onChange: createSetHistogramNameAction
  }, dispatch)
)(Select);

const getDomain = createSelector(
  [ getDendrogram,
    getPredictions,
    getHistogramData,
    getHistogramSelectProps
  ],
  ({instances}, {classes}, data, {value}) => {
    const {series=[]} = data.get(value, {});

    return Set(series.filter((d,i) => classes[i] !== -1))
      .toArray()
      .sort();
  }
);

const getTimeline = createSelector(
  [ getNestedDataFromLabels,
    getDomain,
    getHistogramData,
    getHistogramSelectProps,
    state => state.getIn(getModelPath('instances')),
    state => state.getIn(getModelPath('labels')),
    (state, {group}) => group
  ],
  (data, xDomain, histData, {value}, instances, labels, group) => {
    if (value === undefined) {
      return [];
    }

    const {series=[], xType} = histData.get(value, {});

    const getValue = i => series[i];

    const ids = merge([...data.get(group).values()]);

    const labeledInstances = ids
      .filter(i => labels.has(instances[i]));

    const unlabeledInstances = ids
      .filter(i => !labels.has(instances[i]));

    const getOrdinalData = instances =>
      nest()
        .key(getValue)
        .entries(instances)
        .map(({key, values}) => ({x: key, y: values.length, values}));

    const getRealData = instances => {
      const xExtent = extent(xDomain);

      const xScale = (xType === 'time' ? scaleTime : scaleLinear)()
        .domain(xExtent)
        .nice();

      const binned = histogram()
        .domain(xScale.domain())
        .value(getValue)
        .thresholds(xScale.ticks())(
          instances
        );

      return binned.map(values =>
        ({values, x: Number(values.x0), y: values.length})
      );
    }

    if (xType === 'ordinal') {
      return {
        data: [labeledInstances, unlabeledInstances].map(getOrdinalData),
        xType,
        xDomain,
        instances
      };

    } else {

      return {
        data: [labeledInstances, unlabeledInstances].map(getRealData),
        xType,
        instances
      };
    }
  }
);

const withSi = format('.2s');
const tickFormat = d => d < 1000 ? d : withSi(d);

const Histogram = ({data=[], instances, onClick, xDomain, ...rest}) => {
  const crowded = Math.max(max(data, d => d.length), (xDomain || []).length) > 3;

  return data.length
    ? <FlexibleWidthXYPlot
        height={150}
        margin={{
          left: 35,
          right: 10,
          bottom: crowded ? 65 : 25
        }}
        xDomain={xDomain}
        stackBy='y'
        {...rest}
      >
        { data.map((series, i) =>
            <VerticalBarSeries
              key={i}
              data={series}
              onValueClick={({values}) => onClick(values.map(i => instances[i]))}
              style={{cursor: 'pointer'}}
            />
          )
        }

        <XAxis tickLabelAngle={crowded ? -45 : 0} />
        <YAxis tickFormat={tickFormat} />
      </FlexibleWidthXYPlot>
    : <div />
}

export default connect(
  () => getTimeline,
  dispatch => bindActionCreators({
    onClick: createShowMoreAction
  }, dispatch)
)(Histogram);
