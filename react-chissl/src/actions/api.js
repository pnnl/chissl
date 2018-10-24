
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

import {isKeyed, fromJS, Set, Map, OrderedMap} from 'immutable'
import {get, post, patch} from 'axios'

import {zip, merge} from 'd3-array'

import store from '../stores'

import {createAction} from '.'

import {
  createOpenApplicationsAction,
} from '../actions/ui'

import {
  SETUP_PATH
} from '../actions/setup'

import {
  createCreateErrorAction
} from '../actions/errors'

import {
  getPredictions,
  getBorderlines
} from '../selectors'

export const DEFAULT_PATH = ['api', 'recent'];
export const CURRENT_MODEL_PATH = ['api', 'currentModel'];

const reviver = (key, value) =>
  isKeyed(value)
    ? value.toOrderedMap()
    : value.toArray()

const getPathFromResponse = response =>
  response.config.url
    .split('/')
    .filter(s => s.length)

export const createMergeURLAction = (promise, saveTo=DEFAULT_PATH) =>
  dispatch =>
    promise
      .then(response => {
        console.log('Merging', response);

        if (response && response.data) {

          const path = getPathFromResponse(response);

          dispatch(createAction({
            setIn: [saveTo, path],
            mergeDeepIn: [
              path,
              fromJS(response.data, reviver)
            ]
          }));
        }
      })
      .catch(error =>
        dispatch(createCreateErrorAction(error))
      )

export const getCurrentNames = (state, path=DEFAULT_PATH) => {
  const data = state.getIn(path, []);
  return {
    application: data[2],
    model: data[4]
  };
}

export const getModelPath = (...args) =>
  [...store.getState().getIn(CURRENT_MODEL_PATH, []), ...args]

export const getCurrentData = (state, path=DEFAULT_PATH) =>
  state.getIn(state.getIn(path, []), Map())

export const createSetDatasetAction = (application, model) =>
  (dispatch, getState) => {
    dispatch(createOpenApplicationsAction());

    createMergeURLAction(
      get(`/api/applications/${application}/transduction/${model}`),
      CURRENT_MODEL_PATH
    )(dispatch, getState);
}

export const createUpdateDatasetAction = () => (dispatch, getState) => {
  const state = getState();
  const {application, model} = getCurrentNames(state, CURRENT_MODEL_PATH);
  const {instances, classes} = getPredictions(state)
  const path = getModelPath();
  const borderlines = Set(merge(getBorderlines(state).values()));

  const transduction = Map(
    zip(instances, classes)
      .filter(([i, c]) => c !== -1 && !borderlines.has(i))
  ).toJS();

  const query = state.getIn([...path, 'query'])

  const labels = state.getIn([...path, 'labels'])
    .toJS();

  const colors = state.getIn([...path, 'colors'], {});

  createMergeURLAction(
    patch(
      `/api/applications/${application}/transduction/${model}`,
      {labels, transduction, colors, query},
      {timeout: 5*60*1000} // 5 minute timeout
    ).then(response => {
      console.log('Deleting old structure');
      
      dispatch(createAction(
        {deleteIn: [[...path, 'parents']]},
        {deleteIn: [[...path, 'costs']]},
        {deleteIn: [[...path, 'instances']]},
        {deleteIn: [[...path, 'labels']]},
        {deleteIn: [[...path, 'X']]},
      ))

      return response;
    }),
    CURRENT_MODEL_PATH
  )(dispatch, getState);
};

export const createUpdateLabelsAction = () => (dispatch, getState) => {
  const state = getState();
  const {application, model} = getCurrentNames(state, CURRENT_MODEL_PATH);

  const path = getModelPath();
  
  const labels = state.getIn([...path, 'labels'])
    .toJS();

  const colors = state.getIn([...path, 'colors'], {});

  createMergeURLAction(
    patch(
      `/api/applications/${application}/transduction/${model}`,
      {labels, colors}
    ),
    CURRENT_MODEL_PATH
  )(dispatch, getState);
};


export const createUpdateModelFieldAction = (key, value) => (dispatch, getState) => {
  const state = getState();
  const {application, model} = getCurrentNames(state, CURRENT_MODEL_PATH);

  const path = getModelPath();
  
  const labels = state.getIn([...path, 'labels'])
    .toJS();

  createMergeURLAction(
    post(
      `/api/applications/${application}/transduction/${model}/`,
      {labels}
    ),
    CURRENT_MODEL_PATH
  )(dispatch, getState);
};

export const createListApplicationsAction = () =>
  createMergeURLAction(get('/api/applications/'))

export const createSetApplicationAction = application =>
  createMergeURLAction(get(`/api/applications/${application}/`))

export const createCreateModelAction = (application, data={}) => 
  (dispatch, getState) => {
    const url = `/api/applications/${application}/transduction/`;
    const path = ['api', 'applications', application, 'transduction', data.model];

    dispatch(createAction(
      { setIn: [ path,
                 fromJS(data).set('date', String(new Date())) ]
      },
      { deleteIn: [SETUP_PATH]}
    ));

    createMergeURLAction(
      post(url, data)
        .catch(error => {
          dispatch(createAction({setIn: [[...path, 'error'], error]}));
          throw error;
        })
    )(dispatch, getState);
  }

export const createDeployModelAction = () =>
  (dispatch, getState) => {
    const state = getState();
    const {application, model} = getCurrentNames(state, CURRENT_MODEL_PATH);
    const labels = getCurrentData(state)
      .get('labels', Map())
      .toJS();

    createMergeURLAction(post(
      `/api/applications/${application}/induction/`,
      {model, labels}
    ))(dispatch, getState);
  }