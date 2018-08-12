import {createAction} from '.'

export const SETUP_PATH = ['ui', 'setup'];

export const createSetupAction = (key, value) =>
  createAction({setIn: [[...SETUP_PATH, key], value]})

