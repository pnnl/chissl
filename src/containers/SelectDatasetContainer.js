
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
import {Map} from 'immutable';

import {format} from 'd3-format';

import FolderIcon from '@material-ui/icons/Folder'

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import {CardHeader} from '@material-ui/core/Card'
import Avatar from '@material-ui/core/Avatar'

import Accordion from '../components/Accordion'

import {
    createSetDatasetAction
} from '../actions/api'

import {
  createCloseDatasetAction
} from '../actions/ui';

import InstanceComponent from '../components/InstanceComponent'

const withSi = format('.2s');
const withCommas = format(',');

const DatasetComponent = ({name, data, onClick}) =>
  <List>
    <ListItem>
      <InstanceComponent
        dataset={name}
        value={data.get('example')}
        props={data.get('props', Map()).toJS()}
      />
    </ListItem>

    { data.get('models').map(d =>
        <ListItem key={d} button onClick={() => onClick(name, d)}>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>

          <ListItemText primary={d}/>
        </ListItem>
      )
    }
  </List>

const DrawerContainer = ({datasets, onClick, ...props}) =>
  <Drawer
    anchor="left"
    {...props}
  >
    <Accordion>
      { datasets.sortBy((_, k) => k.toLowerCase()).entrySeq().map(([k, v]) => 
          <DatasetComponent
            key={k}
            heading={
              <CardHeader
                avatar={<Avatar>{v.get('models').size}</Avatar>}
                title={k.replace('chissl_', '')}
                subheader={`${withSi(v.get('instances'))} instances / ${withCommas(v.get('tags', 0))} tags`}
              />
            }
            name={k}
            data={v}
            onClick={onClick}
          />
        )
      }
    </Accordion>

  </Drawer>

export default connect(
  state => ({
    datasets: state.get('datasets', Map()),
    open: state.getIn(['ui', 'datasetsOpenedByUser'], true) || !state.hasIn(['ui', 'currentDataset']),
  }),
  dispatch => bindActionCreators({
    onClick: createSetDatasetAction,
    onClose: createCloseDatasetAction
  }, dispatch)
)(DrawerContainer);
