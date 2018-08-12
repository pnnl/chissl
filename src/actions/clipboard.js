import {createAction} from '.'

export const CLIPBOARD_PATH = ['ui', 'clipboard'];

export const createClipboardAction = (key, value) =>
  createAction({setIn: [[...CLIPBOARD_PATH, key], value]})

