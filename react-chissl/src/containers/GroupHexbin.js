
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

import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'
import {Set, Map} from 'immutable'

import ContainerDimensions from 'react-container-dimensions'

import {getDendrogram, getPredictions} from '../selectors'

import {nest} from 'd3-collection'
import {scan, sum} from 'd3-array'

import {scaleSequential} from 'd3-scale'
import {interpolatePRGn as interpolateDivergent} from 'd3-scale-chromatic'

import {
  getModelPath
} from '../actions/api'

import {
  createShowMoreAction,
} from '../actions/ui'

import {
  unlabeledColor
} from '../actions/labeling'

import Chart, {HexbinPlot, ScatterPlot} from '../charts'

const getTotalFlow = (data=[], source, target) =>
    nest()
      .key(d => d[source])
      .key(d => d[target])
      .rollup(leaves => leaves.map(d => d._id))
      .map(data.filter(d => d[source] !== d[target]))

export const prepareDataForScatter = createSelector(
  [ getDendrogram,
    getPredictions,
    state => state.getIn(getModelPath('X'))
  ],
  ({instances}, {previousClasses, classes}, position) =>{
    const data = instances.map((_id, i) => ({
      _id, i,
      x: position[i][0],
      y: position[i][1],
      group: classes[i],
      groupBefore: previousClasses[i]
    }));

    const delta = sum(data, ({groupBefore, group}) => groupBefore != group);

    const colorScale = scaleSequential(interpolateDivergent)
      .domain([-delta, delta]);

    const flow = {
      from: getTotalFlow(data, 'group', 'groupBefore'),
      to: getTotalFlow(data, 'groupBefore', 'group')
    };

    return {data, colorScale, flow};
  }
)

const HexbinBase = ({data=[], ...props}) =>
  <ContainerDimensions>
    { ({ width }) =>
        <Chart
          width={width}
          height={width}
          margin={20}
          data={data}
          x='x'
          y='y'
        >
          <HexbinPlot {...props} />
        </Chart>
    }
  </ContainerDimensions>

const getBinSummary = (data, subset=[]) => {
  subset = Set(subset);

  if (subset.size > 0) {
    data = data.filter(d => subset.has(d._id));
  }

  if (data.length === 0) {
    return {key: -1, value: 0};
  }
  
  const counts = nest()
    .key(d => d.group)
    .rollup(leaves => leaves.length)
    .entries(data);

  const {key, value} = counts[scan(counts, (a, b) => b.value - a.value)];
  const total = sum(counts, d => d.value);

  return {key, value: value/total};
}

const OverviewHexbinComponent = ({data=[], colors=Map(), subset, onClick}) => {
  const getStyles = d => {
    const {key, value} = getBinSummary(d, subset);

    return {
      onClick: () => onClick(d.map(({_id}) => _id)),
      style: {
        fill: colors.get(key, unlabeledColor),
        fillOpacity: value
      }
    };
  }

  return <HexbinBase
    data={data}
    style={{stroke: 'darkgray', strokeWidth: 1}}
    eachPath={getStyles}
    density={.025}
  />
}

export const OverviewHexbin = connect(
  state => ({
    ...prepareDataForScatter(state),
    colors: state.getIn(getModelPath('colors'))
  }),
  dispatch => bindActionCreators({
    onClick: createShowMoreAction
  }, dispatch)
)(OverviewHexbinComponent)

const GroupHexbinComponent = ({data=[], group, colorScale}) => {
  const signum = (d) => {
    if (group === d.group && group !== d.groupBefore) {
      return 1;
    } else if (group !== d.group && group === d.groupBefore) {
      return -1;
    } else {
      return 0;
    }
  }

  const getStyle = d => {
    const delta = sum(d, signum);

    return {
      style: {
        fill: colorScale(delta),
        stroke: 'darkgray',
        strokeWidth: delta !== 0 ? 1 : 0
      }
    };
  }

  return <HexbinBase
    data={data}
    style={{stroke: 'darkgray', strokeWidth: 1}}
    eachPath={getStyle}
  />
}

export const GroupHexbin = connect(
  prepareDataForScatter
)(GroupHexbinComponent)

export default HexbinBase
