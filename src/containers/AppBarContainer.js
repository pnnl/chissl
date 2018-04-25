
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

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import MenuIcon from 'material-ui-icons/Menu';

import {createOpenDatasetAction} from '../actions/ui';

import IconActionButtonContainer from './IconActionButtonContainer';
import DownloadContainer from './DownloadContainer';
import InteractionStyleContainer from './InteractionStyleContainer';

const styles = theme => ({
  root: {
    marginTop: 10,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  wrapper: {
    position: 'relative',
  },
  button: {
    margin: theme.spacing.unit
  }
});

const AppBarComponent = ({classes, title, isLoading, onClick, children}) =>
  <div className={classes.root}>
    <AppBar position='static'>
      <Toolbar>

        <IconActionButtonContainer
          color='inherit'
          aria-label='Menu'
          action={createOpenDatasetAction()}
        >
          <MenuIcon/>
        </IconActionButtonContainer>

        <Typography type='title' color='inherit'>
          {title}
        </Typography>

        <DownloadContainer />

        <InteractionStyleContainer />

        <div style={{flex: 1}}/>

        { children }

      </Toolbar>
    </AppBar>  
  </div>

export default connect(
  state => ({
    title: `${state.getIn(['ui', 'currentDataset'], '')} / ${state.getIn(['ui', 'currentModel'], '')}`,
    isLoading: state.hasIn(['ui', 'currentDataset']) && !state.has('data')
  }),
  dispatch => bindActionCreators({
    onClick: createOpenDatasetAction,
  }, dispatch)
)(withStyles(styles)(AppBarComponent));
