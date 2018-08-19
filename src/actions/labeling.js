import {Map, OrderedMap} from 'immutable';

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
  if (!(keys instanceof Array)) {
    keys = [keys];
  }

  const labels_path = getModelPath('labels');
  const labels = store.getState().getIn(labels_path, OrderedMap());

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

  return createAction({mergeIn: [labels_path, newLabels]});
}

export const createClearGroupAction = () =>
  createAction({setIn: [getModelPath('labels'), OrderedMap()]});

export const createDeleteGroupAction = group => {
  const labels_path = getModelPath('labels');
  const labels = store.getState().getIn(labels_path, OrderedMap())
    .filter(d => d !== group);

  return createAction(
    {setIn: [labels_path, labels]}
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

