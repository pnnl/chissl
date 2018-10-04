import {Map, OrderedMap} from 'immutable';

import {scaleOrdinal, schemeCategory10} from 'd3-scale'

import {createAction} from '.';
import store from '../stores';

import {
  getModelPath,
} from './api.js'

export const unlabeledColor = 'lightgray'

export const createSetLabelAction = (k, v) =>
  createAction({setIn: [getModelPath('labels', k), v]});

export const createRemoveLabelAction = k =>
  createAction({deleteIn: [getModelPath('labels', k)]});

const defaultColors = scaleOrdinal(schemeCategory10);

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

  const newColors = Map(
    newLabels.valueSeq()
      .map(d => [d, defaultColors(d)])
  );

  return createAction(
    {mergeIn: [labels_path, newLabels]},
    {mergeIn: [getModelPath('colors'), newColors]}
  );
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
  const state = store.getState();
  const labels_path = getModelPath('labels')

  const labels = state.getIn(labels_path, OrderedMap())
    .map(v => v === oldName ? newName : v);

  const color = state.getIn(getModelPath('colors', oldName));

  return createAction(
    {setIn: [labels_path, labels]},
    {deleteIn: [getModelPath('colors', oldName)]},
    {setIn: [getModelPath('colors', newName), color]},
  );
}

