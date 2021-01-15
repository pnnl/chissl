import React from 'react';

import {ChisslWidget} from '../src'

import props from './props.json'

console.log(props)

export default {
  title: 'Entire Application',
  component: ChisslWidget,
};


export const Test = () =>
  <ChisslWidget
    {...props}
    component='img'
    prefix='http://localhost:8000/'
    suffix='.png'
  />


const state = {
  'colors': {
    'Group 0': '#1f77b4',
    'Group 1': '#ff7f0e',
    'Group 2': '#2ca02c',
    'Group 3': '#d62728',
    'Group 4': '#9467bd',
    'Group 5': '#8c564b',
    'Group 6': '#e377c2'
  },
 'labels': {
    '27': 'Group 5',
    '32': 'Group 6',
    '53': 'Group 1',
    '207': 'Group 0',
    '290': 'Group 4',
    '779': 'Group 2',
    '1171': 'Group 3'
  }
};

export const TestWithLabelsInProps = () =>
  <ChisslWidget
    {...props}
    {...state}
    component='img'
    prefix='http://localhost:8000/'
    suffix='.png'
  />
