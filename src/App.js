
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

import React, { Component } from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {List} from 'immutable';

import {createInitAction} from './actions/ui';

import { withStyles } from 'material-ui/styles';

import AppBarContainer from './containers/AppBarContainer';
import SelectDatasetContainer from './containers/SelectDatasetContainer';
import QueryContainer from './containers/QueryContainer';
import InstanceTableContainer from './containers/InstanceTableContainer';
import UnlabeledDataContainer from './containers/UnlabeledDataContainer';
import MoreDrawerContainer from './containers/MoreDrawerContainer';
import ActiveLearningTableContainer from './containers/ActiveLearningTableContainer'

const styles = theme => ({
  column: {
    display: 'inline-block',
  }
});        

class App extends Component {
  componentDidMount() {
    this.props.onChange();
  }

  render() {
    const {sequential} = this.props;
    return (
      <div className='App'>
        <AppBarContainer>
          <div style={{width: 350, color: 'black'}}>
            <QueryContainer />
          </div>
        </AppBarContainer>

        <MoreDrawerContainer/>

        <SelectDatasetContainer />

        <UnlabeledDataContainer/>

        { sequential
            ? <ActiveLearningTableContainer />
            : <InstanceTableContainer/>
        }

      </div>
    );
  }
}

export default connect(
  state => ({
    sequential: state.getIn(['ui', 'activeLearningStyle']),
    tags: state.getIn(['datasets', state.getIn(['ui', 'currentDataset']), 'tags'], List()),
  }),
  dispatch => bindActionCreators({
    onChange: createInitAction
  }, dispatch)
)(withStyles(styles)(App));