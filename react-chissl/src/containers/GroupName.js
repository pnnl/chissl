
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

import {debounce} from 'lodash'

import TextField from '@material-ui/core/TextField'

import {createAction} from '../actions'

import {createRenameGroupAction} from '../actions/labeling'

class GroupNameContainer extends React.Component {
  state = {
    value: ''
  }

  emitChange = debounce(value => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(value);
    }
  }, 250)

  handleChange = ev => {
    const value = ev.target.value;
    this.setState({value});
    this.emitChange(value);
  }

  handleNewProps = props => {
    const {value=''} = props;
    this.setState({value});
  }

  componentWillReceiveProps(nextProps) {
    this.handleNewProps(nextProps);
  }

  componentDidMount() {
    this.handleNewProps(this.props);
  }

  componentWillUnMount() {
    this.emitChange.cancel();
  }

  render() {
    return <TextField
      {...this.props}
      {...this.state}
      onChange={this.handleChange}
    />
  }
}

export default connect(
  null,
  (dispatch, {value}) => ({
    onChange: newValue => dispatch(createRenameGroupAction(value, newValue))
  })
)(GroupNameContainer)