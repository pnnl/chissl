
/* 
  BSD License:
  
  CHISSL: Interactive Machine Learning
  
  Copyright © 2018, Battelle Memorial Institute
  
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
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {Map, List} from 'immutable';

import Card, { CardHeader, CardContent } from 'material-ui/Card';

import {PaginationContainer} from './SimpleContainers';
import InstanceContainer from './InstanceContainer';

import {range, mean, deviation} from 'd3-array';
import {nest} from 'd3-collection';

const Borderlines = ({values=[], page, rowsPerPage}) =>
  <Card>
    <CardHeader title='Borderlines' />

    <PaginationContainer
      path='ui.borderlines'
      component='div'
      count={values.length}
    />

    <CardContent>
      { values
          .slice(rowsPerPage*page, rowsPerPage*(page + 1))
          .map(d => <InstanceContainer key={d} value={d} />) }
    </CardContent>

  </Card>

const getBorderlines = createSelector(
  [ state => state.getIn(['data', 'instances'], List()),
    state => state.get('classes', []),
    state => state.get('distances', [])
  ],
  (instances, classes, distances) => {
    const values = instances.keySeq()
      .filter(d => classes[d] !== undefined && classes[d] !== -1)
      .toArray();

    const stats = nest()
      .key(d => classes[d])
      .rollup(leaves => {
        const values = leaves.map(d => distances[d]);
        return {mean: mean(values), std: deviation(values)};
      })
      .map(values);

    const norm = i =>
      (distances[i] - stats.get(classes[i]).mean)/stats.get(classes[i]).std;

    console.log(values, stats);

    return values.sort((a,b) => norm(b) - norm(a));
  }
);

export default connect(
  state => ({
    values: getBorderlines(state),
    page: state.getIn(['ui', 'borderlines', 'page'], 0),
    rowsPerPage: state.getIn(['ui', 'borderlines', 'rowsPerPage'], 10)
  })
)(Borderlines);