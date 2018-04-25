
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

import {scaleOrdinal, scaleLinear, scaleTime} from 'd3-scale';
import {range, max, extent} from 'd3-array';
import {stack} from 'd3-shape';
import {timeFormat} from 'd3-time-format';

import './Histogram.css';

const formatTime = timeFormat('%b %d, %Y');

const palette = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];

const color = scaleOrdinal()
  .range(palette);

const Histogram = ({keys, values, range, width=300, height=100}) => {
  const layout = stack()
    .keys(keys)
    (values);

  const xScale = scaleTime()
    .domain(range)
    .range([0, width]);

  const yMax = max(layout, group => max(group, height => height[1]));

  const bottomHeight = 30;

  const yScale = scaleLinear()
    .domain([0, yMax])
    .range([height - bottomHeight, 0]);

  const pad = 2;
  const xWidth = xScale(layout[0][0].data.x1) - xScale(layout[0][0].data.x0);
  const tickHeight = 5;

  const axisPoints = [
    [xWidth/2, height - bottomHeight - tickHeight],
    [xWidth/2, height - bottomHeight + tickHeight],
    [width - xWidth/2, height - bottomHeight + tickHeight],
    [width - xWidth/2, height - bottomHeight - tickHeight]
  ];

  return (
    <svg
      style={{width, height}}
      className='histogram-chart'
    >
      { layout.map((groups,i) =>
          <g key={i}>
            { groups.map((height,j) =>
                <rect
                  key={j}
                  style={{fill: color(i)}}
                  x={xScale(height.data.x0) + pad}
                  y={yScale(height[1])}
                  width={xWidth - 2*pad}
                  height={yScale(height[0]) - yScale([height[1]])}
                />
              )
            }
          </g>
        )
      }

      <g className='axis'>
        <text x={xWidth/2 + pad} y={height - bottomHeight/2}>
          {formatTime(range[0])}
        </text>

        <path d={`M${axisPoints.join('L')}`}/>

        <text x={width - xWidth/2 - pad} y={height - bottomHeight/2}>
          {formatTime(range[1])}
        </text>
      </g>

    </svg>
  );
}

export default Histogram;
