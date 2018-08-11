
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

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import 'font-awesome/css/font-awesome.css';

import {range} from 'd3-array';
import {timeFormat} from 'd3-time-format';
import {scaleOrdinal} from 'd3-scale';
import {schemePaired as scheme} from 'd3-scale-chromatic';
import {keys} from 'd3-collection';
import {color} from 'd3-color';

import PopoverComponent from './PopoverComponent'

import './VAST.css';

const icons = {
 'Apartment'  : 'fa fa-fw fa-building',
 'Coffee'     : 'fa fa-fw fa-coffee',
 'Dining'     : 'fa fa-fw fa-cutlery',
 'GASTech'    : 'fa fa-fw fa-suitcase',
 'Gas'        : 'fa fa-fw fa-fire',
 'Home'       : 'fa fa-fw fa-home',
 'Industrial' : 'fa fa-fw fa-truck',
 'Lodging'    : 'fa fa-fw fa-hotel',
 'Public'     : 'fa fa-fw fa-bank',
 'Recreation' : 'fa fa-fw fa-tree',
 'Shopping'   : 'fa fa-fw fa-shopping-cart',
 'Unknown'    : 'fa fa-fw fa-question-circle'
};

const colorScale = scaleOrdinal(scheme);

// ensures color is consistent for icons, and not dependent on order
keys(icons).map(colorScale);

const format = timeFormat('%a %b %d, %Y');

const PlaceIcon = ({place}) => {
  const placeColor = place ? colorScale(place) : 'lightgray';

  return (
    <span
      className='place-icon'
      style={{backgroundColor: placeColor}}
    >
      <i
        className={icons[place] || 'fa fa-fw fa-times'}
        style={{color: color(placeColor).darker()}}
      />
    </span>
  );
}

const PlaceGrid = ({places, nRows=6, nCols=4}) =>
  <div className='place-grid'>
    { range(nRows).map(i =>
        <div key={i}>
          { range(nCols).map(j =>
              <PlaceIcon key={j} place={places[i*nCols + j]}/>
            )
          }
        </div>
      )
    }
  </div>

const DetailsList = ({details}) =>
  <List className='vast-component details-list'>
    { details.map(({Timestamp, category, name}, i) =>
        <ListItem key={i}>
          <ListItemIcon>
            <PlaceIcon place={category}/>
          </ListItemIcon>
          <ListItemText primary={name} secondary={Timestamp}/>
        </ListItem>
      )
    }
  </List>

export const VASTComponent = ({name, date, ...props}) =>
  <PopoverComponent
    title={name}
    subtitle={format(new Date(date))}
    detail={<DetailsList {...props}/>}
    className='vast-component'
  >
    <PlaceGrid {...props}/>
  </PopoverComponent>

export default VASTComponent;
