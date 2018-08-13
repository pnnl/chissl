import {fromJS} from 'immutable'
import {get, post} from 'axios'

import {createAction} from '.'

export const getCurrentApplication = state =>
  state.getIn(['ui', 'path'], [])[2]

export const createMergeURLAction = (method, url, ...args) => dispatch => {
  const path = url.split('/').filter(s => s.length);

  dispatch(createAction({setIn: [['ui', 'path'], path]}));

  method(url, ...args).then(response =>
    dispatch(createAction({mergeIn: [
      path,
      fromJS(response.data)
    ]}))
  )
}

export const createListApplicationsAction = () =>
  createMergeURLAction(get, '/api/applications/')

export const createSetApplicationAction = application =>
  createMergeURLAction(get, `/api/applications/${application}/`)

export const createCreateModelAction = (application, data={}) => 
  (dispatch, getState) => {
    const url = `/api/applications/${application}/transduction/`;

    dispatch(createAction({
      setIn: [ ['api', 'applications', application, 'transduction', data.model],
               fromJS(data).set('date', String(new Date())) ]
    }));

    createMergeURLAction(post, url, data)(dispatch, getState);
  }

