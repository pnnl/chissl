
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

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';

import CloseIcon from '@material-ui/icons/Close';

import InstanceContainer from './InstanceContainer';
import {PaginationContainer} from './SimpleContainers';

import {createHideMoreAction, createSetPageAction} from '../actions/ui.js';

import {OverviewHexbin} from './GroupHexbin'

const MoreDrawerComponent = ({values, page, itemsPerPage, onClose, onRequestMore, ...rest}) =>
  <Drawer
    open={values && values.length > 0}
    variant='persistent'
    anchor='right'
    {...rest}
  >
    <Toolbar>
      <IconButton
        aria-label='Hide'
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>

      <div style={{flex: 1}}/>

      <PaginationContainer
        path='ui.moreDrawer'
        component='div'
        count={values.length}
      />
    </Toolbar>

    <Paper style={{width: 500, overflowY: 'scroll'}}>
      <OverviewHexbin subset={values} />
      { values.slice(itemsPerPage*page, itemsPerPage*(page + 1)).map(d =>
          <InstanceContainer key={d} value={d} />
        )
      }
    </Paper>

  </Drawer>

export default connect(
  state => ({
    values: state.getIn(['ui', 'showMore'], []),
    page: state.getIn(['ui', 'moreDrawer', 'page'], 0),
    itemsPerPage: state.getIn(['ui', 'moreDrawer', 'rowsPerPage'], 10)
  }),
  dispatch => bindActionCreators({
    onClose: createHideMoreAction,
    onRequestMore: createSetPageAction
  }, dispatch)
)(MoreDrawerComponent);
