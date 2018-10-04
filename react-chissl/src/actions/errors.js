import {createAction} from '.';

export const ERRORS_PATH = ['errors'];

export const createCreateErrorAction = error =>
  createAction({setIn: [[...ERRORS_PATH, +(new Date())], error]})

export const createDeleteErrorAction = id =>
  createAction({deleteIn: [[...ERRORS_PATH, id]]})
