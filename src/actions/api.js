import {isKeyed, fromJS, Map, OrderedMap} from 'immutable'
import {get, post} from 'axios'

import {createAction} from '.'

export const DEFAULT_PATH = ['api', 'recent'];
export const CURRENT_MODEL_PATH = ['api', 'currentModel'];

const reviver = (key, value) =>
  isKeyed(value)
    ? value.toOrderedMap()
    : value.toArray()

export const createMergeURLAction = (promise, saveTo=DEFAULT_PATH) =>
  dispatch =>
    promise
      .then(response => {
        const path = response.config.url
          .split('/')
          .filter(s => s.length);

        dispatch(createAction({
          setIn: [saveTo, path],
          mergeDeepIn: [
            path,
            fromJS(response.data, reviver)
          ]
        }));
      })

export const getCurrentNames = (state, path=DEFAULT_PATH) => {
  const data = state.getIn(path, []);
  return {
    application: data[2],
    model: data[3]
  };
}

export const getCurrentData = (state, path=DEFAULT_PATH) =>
  state.getIn(state.getIn(path, []), Map())

export const createSetDatasetAction = (application, model) =>
  createMergeURLAction(
    get(`/api/applications/${application}/transduction/${model}`),
    CURRENT_MODEL_PATH
  )

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

    dispatch(createAction({
      setIn: [ ['api', 'applications', application, 'transduction', data.model],
               fromJS(data).set('date', String(new Date())) ]
    }));

    createMergeURLAction(
      post(url, data)
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