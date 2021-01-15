
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

import {Map, OrderedMap} from 'immutable';

import {scaleOrdinal, schemeCategory10} from 'd3-scale'

import {createAction} from '.';


export const unlabeledColor = 'lightgray';

export const createSetLabelAction = (k, v) =>
  createAction({setIn: [['labels', k], v]});

export const createRemoveLabelAction = k =>
  createAction({deleteIn: [['labels', k]]});

const defaultColors = scaleOrdinal(schemeCategory10);

export const createCreateGroupAction = keys => (dispatch, getState) => {
  if (!(keys instanceof Array)) {
    keys = [keys];
  }

  const labels = getState().get('labels', OrderedMap());

  const groups = Map(labels.valueSeq().map(d => [d, true]))
    .toJS();

  const createGroupName = () => {
    let i = 0;
    let name;
    while ((name = `Group ${i}`) in groups) {
      i++;
    }

    groups[name] = true;
    return name;
  }

  const newLabels = Map(
    keys.map(k => [k, createGroupName()])
  );

  const newColors = Map(
    newLabels.valueSeq()
      .map(d => [d, defaultColors(d)])
  );

  return dispatch(createAction(
    {mergeIn: [['labels'], newLabels]},
    {mergeIn: [['colors'], newColors]}
  ));
}

export const createClearGroupAction = () =>
  createAction({set: ['labels', OrderedMap()]});

export const createDeleteGroupAction = group => (dispatch, getState) => {
  const labels = getState().get('labels', OrderedMap())
    .filter(d => d !== group);

  return dispatch(createAction(
    {set: ['labels', labels]}
  ));
}

export const createRenameGroupAction = (oldName, newName) => (dispatch, getState) => {
  const state = getState();

  const labels = state.get('labels', OrderedMap())
    .map(v => v === oldName ? newName : v);

  const color = state.getIn(['colors', oldName]);

  return dispatch(createAction(
    {set: ['labels', labels]},
    {deleteIn: [['colors', oldName]]},
    {setIn: [['colors', newName], color]},
  ));
}

