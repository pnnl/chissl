
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

import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'
import {hexbin} from 'd3-hexbin'

const constScale = value => {
  function scale() {
    return value;
  }

  scale.range = (...args) =>
    args.length
      ? scale
      : [value, value];

  return scale;
}

export const createAccessor = (field, missingDataValue) =>
  typeof(field) !== 'function'
    ? d => field in d ? d[field] : missingDataValue
    : field

export const createScale = (data, func, scale=scaleLinear) => {
  let [min, max] = extent(data, func);

  return min === max
    ? constScale(min)
    : scale().domain([min, max])
}

export const ScatterPlot = ({data, x, y, xScale, yScale, r, size=10}) => {

  const rScale = createScale(data, r = createAccessor(r, 1))
    .range(1, size)

  return <g>
    { data.map((d, i) =>
        <circle
          key={i}
          cx={xScale(x(d, i))}
          cy={yScale(y(d, i))}
          r={rScale(r(d, i))}
        />
      )
    }
  </g>
}

export const HexbinPlot = ({data, x, y, xScale, yScale, density=0.05, eachPath, ...props}) => {
  const [xmin, xmax] = xScale.range();
  const [ymin, ymax] = yScale.range();
  const width = xmax - xmin;
  const height = ymax - ymin;

  const bins = hexbin()
    .radius(density*Math.min(width, height))
    .extent([[xmin, ymin], [width, height]])
    .x((d, i) => xScale(x(d, i)))
    .y((d, i) => yScale(y(d, i)));

  return <g {...props}>
    { bins(data).map((d, i) =>
        <path
          key={i}
          {...(eachPath && eachPath(d, i))}
          transform={`translate(${d.x}, ${d.y})`}
          d={bins.hexagon()}
        />
      )
    }
  </g>
}
const Chart = ({data=[], width, height, x, y, margin=0, children, ...props}) => {
  const {
    top=margin,
    left=margin,
    bottom=margin,
    right=margin
  } = typeof(margin) === 'number'
    ? {}
    : margin;

  const xScale = createScale(data, x = createAccessor(x))
    .range([left, width - right]);

  const yScale = createScale(data, y = createAccessor(y))
    .range([height - bottom, top]);

  const childProps = {
    data, width, height, x, y, xScale, yScale, ...props
  }

  return <svg width={width} height={height}>
    { React.Children.map(children, child =>
        React.cloneElement(child, childProps)
      ) 
    }
  </svg>
}

export default Chart
