
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

import React from 'react'
import {Map} from 'immutable'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import PopoverComponent from './PopoverComponent'

import {extent} from 'd3-array'
import {scaleLinear} from 'd3-scale'
import {timeFormat} from 'd3-time-format';

import Chart from '../Chart'

import './GraphComponent.css'

const format = timeFormat('%a %b %d, %Y');

const center = ([vmin, vmax]) =>
  vmin === vmax
    ? [vmin - 1, vmin + 1]
    : [vmin, vmax];

const NodeLinkComponent = ({ego, nodes, links, width, height, margin=10}) => {

  const lookup = Map(nodes.map(d => [d._id, d]));

  const xscale = scaleLinear()
    .domain(center(extent(nodes, d => d.x)))
    .range([2*margin, width - 2*margin]);

  const yscale = scaleLinear()
    .domain(center(extent(nodes, d => d.y)))
    .range([2*margin, height - 2*margin]);

  return <g>
    <g key='links' className='links'>
      { links.map(({source, target}, i) =>
          <line
            key={i}
            className={source === ego || target === ego ? 'ego' : ''}
            x1={xscale(lookup.get(source).x)}
            y1={yscale(lookup.get(source).y)}
            x2={xscale(lookup.get(target).x)}
            y2={yscale(lookup.get(target).y)}
          />
        )
      }
    </g>,

    <g key='nodes' className='nodes'>
      { nodes.map(({x, y, _id}) =>
          <circle
            key={_id}
            className={_id === ego ? 'ego' : ''}
            cx={xscale(x)}
            cy={yscale(y)}
          >
            <title>{_id}</title>
          </circle>
        )
      }
    </g>
  </g>;
}

const DetailComponent = ({name, links}) =>
  <List>
    { links
        .filter(({source, target}) => source === name || target === name)
        .map(({source, target, data}) =>
          <ListItem>
            <ListItemText
              secondary={data.map((d, i) => <div key={i}>{d}</div>)}
              primary={
                name === source
                  ? 'to: ' + target
                  : 'from: ' + source
              }
            />
          </ListItem>
        )
    }
  </List>

export const GraphComponent = ({name, date, ...props}) =>
  <PopoverComponent
    title={name}
    subtitle={format(new Date(date))}
    detail={<DetailComponent name={name} {...props}/>}
  >
    <Chart
      width='100%'
      aspect={1}
      axesProps={{fill: '#f6f6f6'}}
      className='graph-component'
    >
      <NodeLinkComponent ego={name} {...props}/>
    </Chart>
  </PopoverComponent>

