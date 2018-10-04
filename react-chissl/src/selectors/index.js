
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

import {createSelector} from 'reselect';
import {List, Set, Map, OrderedMap} from 'immutable';
import {range, mean, deviation} from 'd3-array';
import {nest} from 'd3-collection'

import {getSubGroups, applyLabel} from '../dendrogram';

import {
  CURRENT_MODEL_PATH,
  getCurrentData
} from '../actions/api'

export const getDendrogram = createSelector(
  [
    state => getCurrentData(state, CURRENT_MODEL_PATH).get('instances', []),
    state => getCurrentData(state, CURRENT_MODEL_PATH).get('parents', []),
    state => getCurrentData(state, CURRENT_MODEL_PATH).get('costs', [])
  ],
  (instances, parents, costs) => {
    parents = parents
      .map((d, i) => d === undefined ? i : d);

    const sizes = (new Array(parents.length)).fill(0);

    const depth = (new Array(parents.length).fill(0));

    const lookup = Map(instances.map((d,i) => [d,i]));

    parents.forEach((v,u) => {
      if (u < instances.length) {
        sizes[u] = 1;
      }

      if (u !== v) {
        sizes[v] += sizes[u];
      }
    });

    for (let i = parents.length - 1; i >= 0; i--) {
      depth[i] = depth[parents[i]] + 1;
    }

    let nClusters = 1;
    const k = 10;
    const min_size = 5;

    // try to create at least 10 clusters
    for (let i = parents.length - 1; i >= 0 && nClusters < k; i--) {
      if (sizes[i] > min_size) {
        parents[i] = i;
        nClusters++;
      }
    }

    return {instances, parents, sizes, depth, costs, lookup};
  }
);

const allocatePredictionData = createSelector(
  [ getDendrogram ],
  ({parents}) => ({
    classes: new Array(parents.length),
    distances: new Array(parents.length)
  })
);

export const getPredictions = createSelector(
  [ getDendrogram,
    allocatePredictionData,
    state => getCurrentData(state, CURRENT_MODEL_PATH).get('labels', OrderedMap())
  ],
  (dendrogram, predictions, labels) => {
    const {lookup, instances} = dendrogram;

    const {classes, distances, key} = predictions;

    // copy whatever the state of the classification is before recalculating
    const previousClasses = [...classes];

    labels = labels
      .entrySeq()
      .map(([k, v]) => [lookup.get(k), v])
      .toArray();

    const previousLabels = labels.slice(0, -1);

    // re-apply all of the n - 1 previous labels
    if (key !== JSON.stringify(previousLabels)) {
      console.log('cache miss');

      // initialize prediction data
      classes.fill(-1)
      distances.fill(Infinity);

      // re-apply all of the labelings
      previousLabels.forEach(([k, v]) =>
        applyLabel(dendrogram, classes, distances, k, v)
      );
    }

    // apply the most recent label
    if (labels.length) {
      const [k, v] = labels[labels.length - 1];
      applyLabel(dendrogram, classes, distances, k, v);
    }

    predictions.key = JSON.stringify(labels);

    return {previousClasses, classes, distances, instances};
  }
);

const eps = 1;

export const getBorderlines = createSelector(
  [ getPredictions ],
  ({distances, classes, instances}) => {
    const dist = i => distances[i];

    return nest()
      .key(i => classes[i])
      .rollup(leaves => {
        const u = mean(leaves, dist);
        const s = deviation(leaves, dist);

        return leaves
          .filter(i => dist(i) > u + eps*s)
          .sort((i, j) => dist(j) - dist(i))
          .map(i => instances[i]);
      })
      .map(range(instances.length));
  }
)

export const getNestedDataFromLabels = createSelector(
  [
    getDendrogram,
    getPredictions
  ],
  ({instances, parents, sizes, depth}, {classes}) => {
    const subGroups = getSubGroups(parents, classes, sizes);

    return nest()
      .key(i => classes[i]).sortKeys((a, b) => (+a) - (+b))
      .key(i => subGroups[i])
      .rollup(leaves =>
        leaves.sort((i, j) => depth[j] - depth[i])
      )
      .map(range(instances.length))
  }
);

