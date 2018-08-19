import {OrderedMap} from 'immutable';

import {createAction} from '.';
import store from '../stores';

import {
  getModelPath,
} from './api.js'

export const createSetLabelAction = (k, v) =>
  createAction({setIn: [getModelPath('labels', k), v]});

export const createRemoveLabelAction = k =>
  createAction({deleteIn: [getModelPath('labels', k)]});

export const createCreateGroupAction = keys => {
  const labels = store.getState().getIn(getModelPath('labels'), OrderedMap());

  const n = labels.size ? labels.max() + 1 : 0;

  const newLabels = labels.withMutations(labels =>
    (keys instanceof Array ? keys : [keys])
      .map((k,i) => labels.set(k, i + n))
  );

  return createAction({setIn: [getModelPath('labels'), newLabels]});
}

export const createClearGroupAction = () =>
  createAction({setIn: [getModelPath('labels'), OrderedMap()]});

export const createDeleteGroupAction = group => {
  const labels = store.getState().getIn(getModelPath('labels'), OrderedMap())
    .filter(d => d !== group);

  return createAction(
    {setIn: [getModelPath('labels'), labels]}
  );
}

