import {Set, OrderedMap} from 'immutable';

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
  const labels_path = getModelPath('labels');
  const labels = store.getState().getIn(labels_path, OrderedMap());

  const groups = Set(labels.valueSeq());

  const groupName = i => `Group ${i}`;

  let i = 0;
  while (groups.has(groupName(i))) {
    i++;
  }

  const newGroupName = groupName(i);

  const newLabels = OrderedMap(
    (keys instanceof Array ? keys : [keys])
      .map(k => [k, newGroupName])
  );

  return createAction({mergeIn: [labels_path, newLabels]});
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

export const createRenameGroupAction = (oldName, newName) => {
  console.log(oldName, '->', newName);

  const state = store.getState();
  const labels_path = getModelPath('labels')
  const labels = state.getIn(labels_path, OrderedMap())
    .map(v => v === oldName ? newName : v);

  return createAction({setIn: [labels_path, labels]});
}

