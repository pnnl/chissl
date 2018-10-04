
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

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import ExpandableCard from '../components/ExpandableCard';

import {OverviewHexbin} from './GroupHexbin'

import GroupFlowToolbar from './GroupFlowToolbar'


import {getNestedDataFromLabels} from '../selectors';

import {
  CURRENT_MODEL_PATH,
  getCurrentData
} from '../actions/api'

import {
  createCreateGroupAction,
  createClearGroupAction,
  createRemoveLabelAction
} from '../actions/labeling';

import {SuggestionsContainer} from './InstanceTableContainer'

const withSi = format('.2s');
const formatAvatar = d => d < 1000 ? d : withSi(d);

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
});

const UnlabeledDataComponent = ({data, instances, labels, onRemoveLabel, onAddLabels, classes}) => {
  const values = data.get(-1);

  return instances.length > 0
    ? <div
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
              <Button
                className={classes.button}
                disabled={!values}
                variant="contained"
                color="primary"
                onClick={() => onAddLabels(values ? [...values.values()].map(d => instances[d[0]]) : [])}
              >
                Add all
                <AddCircleIcon className={classes.rightIcon} />
              </Button> 
            </div>
          }
        >
          <Grid container>
            <GroupFlowToolbar group={-1} direction='from'/>
            <GroupFlowToolbar group={-1} direction='to'/>
            <Grid item xs={12} sm={2} padding={16}>
              <OverviewHexbin />
            </Grid>

            <Grid item xs={12} sm={10}>
              { values
                  ? [...values.keys()].map(key =>
                      <SuggestionsContainer group={-1} subGroup={+key} key={key}/>
                    )
                  : <Typography type='caption' align='center' gutterBottom={true}>
                      There are no unlabeled instances. Drag instances here to un-label them.
                    </Typography>
              }
            </Grid>

          </Grid>
        </ExpandableCard>
      </div>
    : <div />
}

export default connect(
  state => ({
    data: getNestedDataFromLabels(state),
    instances: getCurrentData(state, CURRENT_MODEL_PATH).get('instances', []),
    labels: getCurrentData(state, CURRENT_MODEL_PATH).get('parents', []),
  }),
  dispatch => bindActionCreators({
    onAddLabels: createCreateGroupAction,
    onRemoveLabel: createRemoveLabelAction
  }, dispatch)  
)(withStyles(styles)(UnlabeledDataComponent));
