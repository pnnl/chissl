
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
import {connect} from 'react-redux'
import {Map, OrderedMap} from 'immutable'

import {range} from 'd3-array'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import CloseIcon from '@material-ui/icons/Close';

import InstanceContainer from './InstanceContainer'
import GroupHistogramContainer, {GroupHistogramSelect} from './GroupHistogramContainer'
import IconActionButtonContainer from './IconActionButtonContainer';
import {TextFieldContainer} from './SimpleContainers';

import {getNestedDataFromLabels, getPredictions, getDendrogram} from '../selectors'

import {
  createSetLabelAction,
  createDeleteGroupAction
} from '../actions/labeling';

const OffsetInstanceContainer = connect(
  (state, {group, offset, more=false}) => {
    const items = state.getIn(['ui', 'labels'], OrderedMap())
      .filter(d => d === +group)
      .keySeq()
      .toArray();

    return {
      value: Math.abs(offset) < items.length
        ? items[(offset + items.length)%items.length]
        : undefined,
      more: more ? items : undefined
    }
  },
  null,
  stateProps => stateProps
)(InstanceContainer)

const ActiveLearningTableRowComponent = ({group, histogram, numRecent, onDrop}) =>
  <TableRow onDragOver={preventDefault} onDrop={onDrop}>

    <TableCell padding='checkbox'>
      <IconActionButtonContainer
        aria-label='Delete Selected'
        action={createDeleteGroupAction(+group)}
      >
        <CloseIcon />
      </IconActionButtonContainer>
    </TableCell>

    <TableCell>
      <TextFieldContainer
        path={`ui.groupNames.${group}`}
        style={{width: 150}}
        placeholder={`Group ${group}`}
      />
    </TableCell>

    <TableCell>
      <OffsetInstanceContainer group={group} offset={0} more={true} />
    </TableCell>

    <TableCell>
      { range(-numRecent, 0, 1).map(i =>
          <OffsetInstanceContainer key={i} group={group} offset={i} />
        )
      }
    </TableCell>

    { histogram &&
      <TableCell>
        <GroupHistogramContainer group={group}/>
      </TableCell>
    }
    
  </TableRow>


const preventDefault = ev => ev.preventDefault();

const ActiveLearningTableRow = connect(
  null,
  (dispatch, {group}) => ({
    onDrop: ev => dispatch(createSetLabelAction(
      JSON.parse(ev.dataTransfer.getData('text')),
      group
    ))
  })
)(ActiveLearningTableRowComponent);

const SuggestionContainer = connect(
  state => {
    const labeled = state.getIn(['ui', 'labels']);
    const {lookup, instances} = getDendrogram(state);
    const {distances} = getPredictions(state);

    const sortedInstances = instances
      .filter(d => !labeled.has(d))
      .sort((a, b) => {
        const da = distances[lookup.get(a)];
        const db = distances[lookup.get(b)];

        if (da === Infinity && db === Infinity) {
          return 0;
        }

        return db - da;
      });

    const next = sortedInstances[0];

    return {
      value: next,
      more: sortedInstances
    };
  },
  null,
  stateProps => stateProps
)(InstanceContainer)

const ActiveLearningTable = ({data, histogram, numRecent=3}) =>
  data.size() === 0 || (data.size() === 1 && data.has('-1'))
    ? <div/>
    : <Grid container className='instance-table'>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardHeader
              title='What is this?'
              subheader='Drag the item below to one of your groups the right, our double click to create a new group.'
            />
            <CardContent>
              <SuggestionContainer />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={9}>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>

                  <TableCell padding='checkbox'/>

                  <TableCell />

                  <TableCell>
                    First
                  </TableCell>

                  <TableCell>
                    {numRecent} Most Recent
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
                { [...data.keys()].map(d =>
                    d !== '-1' &&
                    <ActiveLearningTableRow
                      key={d}
                      group={d}
                      numRecent={numRecent}
                      histogram={histogram}
                    />
                  )
                }
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

export default connect(
  state => ({
    data: getNestedDataFromLabels(state),
    histogram: Map(state.getIn(['data', 'hist'])).size > 0
  })
)(ActiveLearningTable)
