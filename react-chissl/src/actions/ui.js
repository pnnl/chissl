
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

import {createAction} from '.';

import {getModelPath} from './api'

export const createOpenDatasetAction = () =>
  createAction({setIn: [['ui', 'datasetsOpenedByUser'], true]});

export const createCloseDatasetAction = () =>
  createAction({setIn: [['ui', 'datasetsOpenedByUser'], false]});

export const createCloseUnsortedAction = () =>
  createAction({deleteIn: [['ui', 'isUnsortedOpen']]});

export const createOpenUnsortedAction = () =>
  createAction({setIn: [['ui', 'isUnsortedOpen'], true]});

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

export const createSetGroupColorAction = (group, color) =>
  createAction({setIn: [getModelPath('colors', group), color]})

export const OPEN_APPLICATIONS_PATH = ['ui', 'openApplications'];

export const createOpenApplicationsAction = value =>
  createAction({setIn: [OPEN_APPLICATIONS_PATH, value]})
