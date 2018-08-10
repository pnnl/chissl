
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
import {Map} from 'immutable'

import {format} from 'd3-format';
import {sum} from 'd3-array';

import Typography from 'material-ui/Typography'

import AddCircleIcon from 'material-ui-icons/AddCircle';
import RemoveCircleIcon from 'material-ui-icons/RemoveCircle';

import IconActionButtonContainer from './IconActionButtonContainer';

import ExpandableCard from '../components/ExpandableCard';

import {getNestedDataFromLabels} from '../selectors';

import {createCreateGroupAction, createClearGroupAction, createRemoveLabelAction} from '../actions/ui';

import {SuggestionsContainer} from './InstanceTableContainer'

const withSi = format('.2s');
const formatAvatar = d => d < 1000 ? d : withSi(d);

const AddAllActionButton = ({values, ...props}) =>
  <IconActionButtonContainer
    aria-label='Add all'
    action={createCreateGroupAction(values)}
    {...props}
  >
    <AddCircleIcon/>
  </IconActionButtonContainer>

const RemoveAllActionButton = props =>
  <IconActionButtonContainer
    aria-label='Remove all'
    action={createClearGroupAction()}
    {...props}
  >
    <RemoveCircleIcon />
  </IconActionButtonContainer>

const UnlabeledDataComponent = ({data, instances, labels, onRemoveLabel}) => {
  const values = data.get('-1');

  return (
    <div
      onDragOver={ev => ev.preventDefault()}
      onDrop={ev => onRemoveLabel && onRemoveLabel(JSON.parse(ev.dataTransfer.getData('text')))}
    >
      <ExpandableCard
        title='Unlabeled Items'
        subheader='Double click an item to create a new group. Drag an item to change its group.'
        avatar={
          values
            ? formatAvatar(sum([...values.values()], d => d.length))
            : '0'
        }
        actions={
          <div>
            <AddAllActionButton
              disabled={values === undefined}
              values={values ? [...values.values()].map(d => instances[d[0]]) : []} />
            <RemoveAllActionButton disabled={labels.size === 0}/>
          </div>
        }
      >
        <div>
          { values
              ? [...values.keys()].map(key =>
                  <SuggestionsContainer group={-1} subGroup={+key} key={key}/>
                )
              : <Typography type='caption' align='center' gutterBottom={true}>
                  There are no unlabeled instances. Drag instances here to un-label them.
                </Typography>
          }
        </div>
      </ExpandableCard>
    </div>
  );
}

export default connect(
  state => ({
    data: getNestedDataFromLabels(state),
    instances: state.getIn(['data', 'instances']),
    labels: state.getIn(['ui', 'labels'], Map())
  }),
  dispatch => bindActionCreators({
    onRemoveLabel: createRemoveLabelAction
  }, dispatch)  
)(UnlabeledDataComponent);