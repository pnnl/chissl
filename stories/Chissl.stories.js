/* 
  BSD License:
  
  CHISSL: Interactive Machine Learning
  
  Copyright © 2021, Battelle Memorial Institute
  
  All rights reserved.
  
  1. Battelle Memorial Institute (hereinafter Battelle) hereby grants permission
     to any person or entity lawfully obtaining a copy of this software and
     associated documentation files (hereinafter “the Software”) to redistribute
     and use the Software in source and binary forms, with or without 
     modification.  Such person or entity may use, copy, modify, merge, publish,
     distribute, sublicense, and/or sell copies of the Software, and may permit
     others to do so, subject to the following conditions:
     * Redistributions of source code must retain the above copyright notice,
       this list of conditions and the following disclaimers.
     * Redistributions in binary form must reproduce the above copyright notice,
       this list of conditions and the following disclaimer in the documentation
       and/or other materials provided with the distribution.
     * Other than as used herein, neither the name Battelle Memorial Institute
       or Battelle may be used in any form whatsoever without the express
       written consent of Battelle. 
  
  2. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
     AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
     THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
     PURPOSEARE DISCLAIMED. IN NO EVENT SHALL BATTELLE OR CONTRIBUTORS BE LIABLE
     FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
     DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
     SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
     CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
     LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
     OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
     DAMAGE.
     
*/

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
