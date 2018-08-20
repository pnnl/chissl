
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
import {connect} from 'react-redux';

import { withStyles } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';

import {createAction} from '../actions';

const getPath = (path='', name) => 
  name === undefined
    ? path.split('.')
    : [...path.split('.'), name];

const mergeProps = (stateProps, dispatchProps, {path, ...ownProps}) =>
  ({...stateProps, ...dispatchProps, ...ownProps})

const styles = {
  bar: {},
  checked: {
    color: green[500],
    '& + $bar': {
      backgroundColor: green[500],
    },
  },
};

const SimpleSwitchComponent = ({path, checked, onChange, classes, ...props}) =>
  <FormControlLabel
    {...props}
    control={
      <Switch
        classes={{
          checked: classes.checked,
          bar: classes.bar,
        }}
        checked={checked}
        onChange={(event, checked) => onChange && onChange(checked)}
      />
    }
  />

export const SimpleSwitch = connect(
  (state, {path}) => ({
    checked: state.getIn(path)
  }),
  (dispatch, {path}) => ({
    onChange: checked => dispatch(createAction({setIn: [path, checked]}))
  })
)(withStyles(styles)(SimpleSwitchComponent))  

export const PaginationContainer = connect(
  (state, {path, ...rest}) => ({
    ...rest,
    page: state.getIn(getPath(path, 'page'), 0),
    rowsPerPage: state.getIn(getPath(path, 'rowsPerPage'), 10),
  }),
  (dispatch, {path}) => ({
    onChangePage: (ev, value) =>
      dispatch(createAction({setIn: [getPath(path, 'page'), value]})),
    onChangeRowsPerPage:  ev =>
      dispatch(createAction({setIn: [getPath(path, 'rowsPerPage'), ev.target.value]}))
  }),
  mergeProps
)(TablePagination);


export const TextFieldContainer =  connect(
  (state, {path, ...rest}) => ({
    ...rest,
    value: state.getIn(getPath(path), '')
  }),
  (dispatch, {path}) => ({
    onChange: ev => dispatch(createAction({setIn: [getPath(path), ev.target.value]}))
  }),
  mergeProps
)(TextField);
