
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
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect'
import {Map, OrderedMap} from 'immutable';

import {mean, deviation, merge} from 'd3-array';

import Toolbar from '@material-ui/core/Toolbar'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent'
import Collapse from '@material-ui/core/Collapse'

import CloseIcon from '@material-ui/icons/Close';

import GroupColorButton from './GroupColorButton'

import GroupFlowToolbar from './GroupFlowToolbar'

import {
  getPredictions,
  getNestedDataFromLabels,
  getBorderlines
} from '../selectors';

import {
  createSetLabelAction,
  createDeleteGroupAction,
} from '../actions/labeling';

import {
  CURRENT_MODEL_PATH,
  getCurrentData
} from '../actions/api'

import {COMPACT_PATH} from './AppBarContainer'

import {GroupHexbin} from './GroupHexbin'
import InstanceContainer from './InstanceContainer';
import IconActionButtonContainer from './IconActionButtonContainer';
import GroupHistogramContainer, {GroupHistogramSelect} from './GroupHistogramContainer';
import GroupName  from './GroupName'

const filterBorderlines = (values, dist, eps=1) => {
  const u = mean(values, dist);
  const s = deviation(values, dist);

  return values
    .filter(i => dist(i) > u + eps*s)
    .sort((i, j) => dist(j) - dist(i));
}

const BorderlinesContainer = connect(
  (state, {group}) => {
    const borderlines = getBorderlines(state).get(group);

    return {
      value: borderlines[0],
      more: borderlines
    };
  },
  null,
  stateProps => stateProps
)(InstanceContainer);

const LabeledContainer = connect(
  () => createSelector(
    [ state => getCurrentData(state, CURRENT_MODEL_PATH).get('labels', OrderedMap()),
      (state, {group}) => group
    ],
    (labels, group) => {
      const values = labels
        .filter(v => v === group)
        .keySeq()
        .toArray();

      return {
        value: values[0],
        more: values
      };
    }
  ),
  null,
  stateProps => stateProps
)(InstanceContainer);

export const SuggestionsContainer = connect(
  () => createSelector(
    [ getNestedDataFromLabels,
      state => getCurrentData(state, CURRENT_MODEL_PATH).get('instances', []),
      (state, {group}) => group,
      (state, {subGroup}) => subGroup,
      state => getCurrentData(state, CURRENT_MODEL_PATH).get('labels', OrderedMap())
    ],
    (data, instances, group, subGroup, labels) => {
      const values = data.get(group).get(subGroup)
        .filter(i => !labels.has(instances[i]));

      return {
        value: instances[values[0]],
        more: values.map(i => instances[i])
      };
    }
  ),
  null,
  stateProps => stateProps
)(InstanceContainer)

const InstanceRowComponent = ({data, compact, group, histogram, onDragOver, onDrop}) =>
  <Grid
    container padding={16}
    onDragOver={onDragOver} onDrop={onDrop}
  >

    <Grid item xs={12} sm={2}>
      <Toolbar disableGutters>

        <IconActionButtonContainer
          aria-label='Delete Selected'
          action={createDeleteGroupAction(group)}
        >
          <CloseIcon />
        </IconActionButtonContainer>

        <GroupName
          value={group}
          style={{width: '100%'}}
          placeholder={`Group ${group}`}
        />

        <GroupColorButton
          style={{marginLeft: 15}}
          group={group}
        />

      </Toolbar>

      <GroupFlowToolbar group={group} direction='from'/>
      <GroupFlowToolbar group={group} direction='to'/>

      { /*
        <Collapse in={compact}>
          <GroupHexbin group={group} />
        </Collapse>
      */ }

    </Grid>

    <Grid item xs={12} sm={2}>
      <LabeledContainer group={group} />
    </Grid>

    <Grid item xs={12} sm={2}>
      <BorderlinesContainer group={group} />
    </Grid>
    
    <Grid item xs={12} sm={histogram ? 4 : 6}>
      { [...data.get(group).keys()].map(key =>
          <SuggestionsContainer group={group} subGroup={key} key={key} />
        )
      }
    </Grid>

    { histogram &&
      <Grid item xs={12} sm={2}>
        <GroupHistogramContainer group={group} />
      </Grid>
    }

  </Grid>

const preventDefault = ev => ev.preventDefault();

const InstanceRowContainer = connect(
  state => ({
    onDragOver: preventDefault,
    compact: state.getIn(COMPACT_PATH),
    data: getNestedDataFromLabels(state),
  }),
  (dispatch, {group}) => ({
    onDrop: ev => dispatch(createSetLabelAction(
      JSON.parse(ev.dataTransfer.getData('text')),
      group
    ))
  })
)(InstanceRowComponent);

const InstanceTableContainer = ({data, labels=OrderedMap(), histogram, ...rest}) => {
  const visited = {}
  const groups = labels.filter(d =>
    d in visited
      ? false
      : visited[d] = true
  );

  return labels.size === 0
    ? <div/>
    : <Card style={{overflow: 'visible'}}>
      <CardContent>
        <Grid container padding={16}>

          <Grid item xs={12} sm={2}>
          </Grid>

          <Grid item xs={12} sm={2}>
            Examples
          </Grid>

          <Grid item xs={12} sm={2}>
            Borderlines
          </Grid>

          <Grid item xs={12} sm={histogram ? 4 : 6}>
            Suggestions
          </Grid>

          { histogram &&
            <Grid item xs={12} sm={2}>
              <GroupHistogramSelect />
            </Grid>
          }

        </Grid>

        <div>
          { groups
              .valueSeq()
              .toArray()
              .map((group, i) =>
                <InstanceRowContainer
                  key={i}
                  group={group}
                  histogram={histogram}
                />
              )
          }
        </div>
      </CardContent>
    </Card>
}
export default connect(
  state => {
    const data = getCurrentData(state, CURRENT_MODEL_PATH);

    return {
      data: getNestedDataFromLabels(state),
      labels: data.get('labels'),
      histogram: data.get('hist', Map()).size > 0
    }
  },
  dispatch => bindActionCreators({
  }, dispatch)
)(InstanceTableContainer);
