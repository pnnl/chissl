
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

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Toolbar from '@material-ui/core/Toolbar'

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent'

import CloseIcon from '@material-ui/icons/Close';

import GroupColorButton from './GroupColorButton'

import {getPredictions, getNestedDataFromLabels} from '../selectors';

import {
  createSetLabelAction,
  createDeleteGroupAction,
} from '../actions/labeling';

import {
  CURRENT_MODEL_PATH,
  getCurrentData
} from '../actions/api'

import GroupHexbin from './GroupHexbin'
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
  () => createSelector(
    [ getNestedDataFromLabels,
      getPredictions,
      state => getCurrentData(state, CURRENT_MODEL_PATH).get('instances', []),
      (state, {group}) => group
    ],
    (data, {distances}, instances, group) => {

      const values = filterBorderlines(merge([...data.get(group).values()]), i => distances[i]);

      return {
        value: instances[values[0]],
        more: values.map(i => instances[i])
      };
    }
  ),
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

const InstanceRowComponent = ({data, group, histogram, onDragOver, onDrop}) =>
  <TableRow onDragOver={onDragOver} onDrop={onDrop}>

    <TableCell>
      <div style={{width: 200}}>
        <Toolbar disableGutters>

          <GroupColorButton
            style={{marginRight: 15}}
            group={group}
          />

          <GroupName
            value={group}
            style={{width: '100%'}}
            placeholder={`Group ${group}`}
          />

          <IconActionButtonContainer
            aria-label='Delete Selected'
            action={createDeleteGroupAction(group)}
          >
            <CloseIcon />
          </IconActionButtonContainer>

        </Toolbar>

        <GroupHexbin group={group} />
      </div>
    </TableCell>

    <TableCell>
      <LabeledContainer group={group} />
    </TableCell>

    <TableCell>
      <BorderlinesContainer group={group} />
    </TableCell>
    
    <TableCell>
      { [...data.get(group).keys()].map(key =>
          <SuggestionsContainer group={group} subGroup={key} key={key} />
        )
      }
    </TableCell>

    { histogram &&
      <TableCell>
        <GroupHistogramContainer group={group} />
      </TableCell>
    }

  </TableRow>

const preventDefault = ev => ev.preventDefault();

const InstanceRowContainer = connect(
  state => ({
    onDragOver: preventDefault,
    data: getNestedDataFromLabels(state),
  }),
  (dispatch, {group}) => ({
    onDrop: ev => dispatch(createSetLabelAction(
      JSON.parse(ev.dataTransfer.getData('text')),
      group
    ))
  })
)(InstanceRowComponent);

const InstanceTableContainer = ({data, histogram, ...rest}) =>
  data.size() === 0 || (data.size() === 1 && data.has('-1'))
    ? <div/>
    : <Card className='instance-table'>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>

              <TableCell>
              </TableCell>

              <TableCell>
                Examples
              </TableCell>

              <TableCell>
                Borderlines
              </TableCell>

              <TableCell>
                Suggestions
              </TableCell>

              { histogram &&
                <TableCell>
                  <div style={{width: 350}}>
                    <GroupHistogramSelect />
                  </div>
                </TableCell>
              }

            </TableRow>
          </TableHead>

          <TableBody>
            { [...data.keys()].map(key =>
                key !== '-1' &&
                <InstanceRowContainer key={key} group={key} histogram={histogram} />
              )
            }
          </TableBody>
        </Table>
      </CardContent>
    </Card>

export default connect(
  state => ({
    data: getNestedDataFromLabels(state),
    histogram: getCurrentData(state, CURRENT_MODEL_PATH).get('histogram', Map()).size > 0
  }),
  dispatch => bindActionCreators({
  }, dispatch)
)(InstanceTableContainer);
