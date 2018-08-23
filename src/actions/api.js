import {isKeyed, fromJS, Map, OrderedMap} from 'immutable'
import {get, post} from 'axios'

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
        if (response) {
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
    model: data[3]
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

  const keys = {'labels': true, 'query': true, 'project': true};
  const params = getCurrentData(state)
    .filter((v, k) => k in keys)
    .toJS();

  createMergeURLAction(
    post(
      `/api/applications/${application}/transduction/${model}`,
      params
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