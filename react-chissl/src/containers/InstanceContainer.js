
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

import {connect} from 'react-redux';
import {Map} from 'immutable'

import InstanceComponent from '../components/InstanceComponent';

import {
  getCurrentNames,
  CURRENT_MODEL_PATH
} from '../actions/api'

import {createShowMoreAction} from '../actions/ui';

import {createCreateGroupAction} from '../actions/labeling';

export default connect(
  (state, {value, ...rest}) => {
    const {application} = getCurrentNames(state, CURRENT_MODEL_PATH);
    const applicationData = state.getIn(
      [
        'api',
        'applications',
        application
      ],
      Map()
    );

    return {
      draggable: true,
      collection: applicationData.get('collection'),
      component: applicationData.get('component'),
      props: applicationData.get('props', Map()).toJS(),
      ...rest
    };
  },
  (dispatch, {value, more}) => ({
    onDragStart: ev => ev.dataTransfer.setData('text', JSON.stringify(value)),
    onDoubleClick: () => dispatch(createCreateGroupAction(value)),
    onShowMore: () => dispatch(createShowMoreAction(more))
  })
)(InstanceComponent);
