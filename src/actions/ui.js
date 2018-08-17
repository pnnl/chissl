
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

import {OrderedMap, Map} from 'immutable';
import {get} from 'axios';

import {createAction} from '.';
import store from '../stores';

export const createSetDatasetAction = (currentDataset, currentModel) =>
  (dispatch, getState) => {
    dispatch(createAction(
      {setIn: [['ui', 'currentDataset'], currentDataset]},
      {setIn: [['ui', 'currentModel'], currentModel]},
      {setIn: [['ui', 'datasetsOpenedByUser'], false]},
      {setIn: [['ui', 'isUnsortedOpen'], true]},
      {deleteIn: [['ui', 'histogram', 'name']]},
      {delete: ['data']},
    ));

  get(`/api/applications/${currentDataset}/transduction/${currentModel}`)
    .then(response => {
      console.log('got some data', response.data);
      
      const labelsMap = Map(response.data.labels || {});

      const labels = OrderedMap(
        labelsMap
          .keySeq()
          .toArray()
          .map((k, i) => [k, i])
      );

      const groupNames = Map(
        labelsMap
          .valueSeq()
          .toArray()
          .map((v, i) => [String(i), v])
      );

      dispatch(createAction(
        {set: ['data', Map(response.data)]},
        {setIn: [['ui', 'labels'], labels]},
        {setIn: [['ui', 'groupNames'], groupNames]}
      ))
    });
};

export const createUpdateDatasetAction = query => (dispatch, getState) => {
  const state = getState();
  const currentDataset = state.getIn(['ui', 'currentDataset']);
  const currentModel = state.getIn(['ui', 'currentModel']);

  dispatch(createAction(
    {setIn: [['ui', 'query'], query]},
    {delete: ['data']}
  ));

  const tags = query.keySeq()
    .join(',');

  const labels = state.getIn(['ui', 'labels'], Map())
    .keySeq()
    .join(',');

  const config = {
    headers: {'Content-Type': 'application/json'},
    params: {tags, labels},
  };

  get(`/api/${currentDataset}/models/${currentModel}`, config)
    .then(response => console.log('updated some data', response.data) ||
      dispatch(createAction(
        {set: ['data', Map(response.data)]}
      ))
    );
};

export const createSetQueryAction = value => {
  const query = Map(value === ''
    ? []
    : value.split(',').map(d => [d, 'must'])
  );

  return createUpdateDatasetAction(query);
};

export const createOpenDatasetAction = () =>
  createAction({setIn: [['ui', 'datasetsOpenedByUser'], true]});

export const createCloseDatasetAction = () =>
  createAction({setIn: [['ui', 'datasetsOpenedByUser'], false]});

export const createCloseUnsortedAction = () =>
  createAction({deleteIn: [['ui', 'isUnsortedOpen']]});

export const createOpenUnsortedAction = () =>
  createAction({setIn: [['ui', 'isUnsortedOpen'], true]});

export const createSetLabelAction = (k, v) =>
  createAction({setIn: [['ui', 'labels', k], v]});

export const createRemoveLabelAction = k =>
  createAction({deleteIn: [['ui', 'labels', k]]});

export const createCreateGroupAction = keys => {
  const labels = store.getState().getIn(['ui', 'labels'], OrderedMap());

  const n = labels.size ? labels.max() + 1 : 0;

  const newLabels = labels.withMutations(labels =>
    (keys instanceof Array ? keys : [keys])
      .map((k,i) => labels.set(k, i + n))
  );

  return createAction({setIn: [['ui', 'labels'], newLabels]});
}

export const createClearGroupAction = () =>
  createAction({setIn: [['ui', 'labels'], OrderedMap()]});

export const createDeleteGroupAction = group => {
  const labels = store.getState().getIn(['ui', 'labels'])
    .filter(d => d !== group);

  return createAction(
    {setIn: [['ui', 'labels'], labels]}
  );
}

export const createSplitOnAction = root =>
  createAction({setIn: [['ui', 'splits', root], true]});

export const createSelectGroupAction = (group, value=true) =>
  value
    ? createAction({setIn: [['ui', 'selection', group], true]})
    : createAction({deleteIn: [['ui', 'selection', group]]});

export const createShowMoreAction = values =>
  createAction({setIn: [['ui', 'showMore'], values]});

export const createHideMoreAction = () =>
  createAction({
    deleteIn: [['ui', 'showMore']],
    setIn: [['ui', 'showMorePage'], 1]
  });

export const createSetPageAction = page =>
  createAction({setIn: [['ui', 'showMorePage'], page]});

export const createSetSortSuggestionsAction = order =>
  createAction({setIn: [['ui', 'sortSuggestions'], order]});

export const createSetHistogramNameAction = value =>
  createAction({setIn: [['ui', 'histogram', 'name'], value]});

export const createSetActiveLearningStyle = value =>
  createAction({setIn: [['ui', 'activeLearningStyle'], value]});
