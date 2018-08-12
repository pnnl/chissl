import {fromJS} from 'immutable'
import {get} from 'axios'
import {createAction} from '.'

export const getCurrentApplication = state =>
  state.getIn(['ui', 'path'], [])[2]

export const createMergeURLAction = (url, method=get) => dispatch => {
  const path = url.split('/').filter(s => s.length);

  dispatch(createAction({setIn: [['ui', 'path'], path]}));

  method(url)
    .then(response =>
      dispatch(createAction({mergeIn: [
        path,
        fromJS(response.data)
      ]}))
    )
}

export const createListApplicationsAction = () =>
  createMergeURLAction('/api/applications/')

export const createSetApplicationAction = application =>
  createMergeURLAction(`/api/applications/${application}/`)
