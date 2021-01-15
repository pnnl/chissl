
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
import {connect} from 'react-redux';
import {List, Map, Set} from 'immutable';
import {createSelector} from 'reselect';

import Select from 'react-select-2';
import 'react-select-2/dist/css/react-select-2.css';

import {createAction} from '../actions';

const mapStateToProps = createSelector(
  [
    (state, {optionsPath=''}) => state.getIn(optionsPath.split('.'), List()),
    (state, {valuesPath=''}) => state.getIn(valuesPath.split('.'), Map()),
    (state, props) => props
  ],
  (options, values, {value=true, ...rest}) => {
    return {
      ...rest,
      options: options
        .filter(d => values.get(d) !== value)
        .sort()
        .map(d => ({label: d, value: d}))
        .toArray(),
      value: values
        .filter((v,k) => v === value)
        .keySeq()
        .map(d => ({label: d, value: d}))
        .toArray(),
      simpleValue: true,
      multi: true,
    };
  }
);

const MultiSelect = ({onSelect, onRemove, value, ...props}) =>
  <Select 
    {...props}
    value={value}
    onChange={values => {
      const oldValues = Set(value.map(d => d.value));
      const newValues = Set(values ? values.split(',') : []);
      
      oldValues.forEach(k => {
        if (!newValues.has(k)) {
          onRemove(k);
        }
      });

      newValues.forEach(k => {
        if (!oldValues.has(k)) {
          onSelect(k);
        }
      })
    }}
  />

export default connect(
  () => mapStateToProps,
  (dispatch, {valuesPath='', value}) => ({
    onSelect: key => {
      dispatch(createAction(
        {setIn: [[...valuesPath.split('.'), key], value]},
        {setIn: [['ui', 'isQueryStale'], true]}
      ));
    },
    onRemove: key => {
      dispatch(createAction(
        {deleteIn: [[...valuesPath.split('.'), key]]},
        {setIn: [['ui', 'isQueryStale'], true]}
      ));
    }
  })
)(MultiSelect);
