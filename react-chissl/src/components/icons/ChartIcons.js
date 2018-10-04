
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

import {RadialChart, RadarChart, LabelSeries} from 'react-vis'

import {schemeCategory10 as scheme, scaleLinear, scaleOrdinal} from 'd3-scale'

const color = scaleOrdinal(scheme);

const defaultProps = {
  margin: {left: 20, right: 20, top: 20, bottom: 20},
  style: {
    axes: {
      line: {},
      ticks: {},
      text: {visibility: 'hidden'}
    },
    labels: {
      fontSize: 10,
      opacity: .5
    },
    polygons: {
      strokeWidth: 2,
      strokeOpacity: 1,
      fillOpacity: 0.6
    }    
  }
};

export const RadialComponent = ({data, domains, width=150, ...rest}) => {
  const wedges = domains
    .map(({name, domain}, i) => ({
      angle: 360/domains.length,
      radius: scaleLinear()
        .domain(domain)
        .range([0, width/2])(
          data[name]
        ),
      color: color(i)
    }));

  return (
    <RadialChart
      colorType='literal'
      width={width}
      height={width}
      data={wedges}
      innerRadius={0}
      {...rest}
    >
      <LabelSeries
        style={{fillOpacity: .5}}
        data={
          domains.map(({name}, i) => ({
            label: name,
            x: width/2*Math.cos(i*2*Math.PI/domains.length),
            y: width/2*Math.sin(i*2*Math.PI/domains.length)
          }))
        }
      />
    </RadialChart>
  );
}

export const RadarComponent = ({data, domains=[], width=150, ...rest}) =>
  <RadarChart
    width={width}
    height={width}
    data={[data]}
    domains={domains.map(({name, domain}) =>
      ({
        name, domain,
        getValue: row => {
          const eps = 1e-6*(domain[1] - domain[0]);

          return Math.min(Math.max(row[name], domain[0] + eps), domain[1] - eps)
        }
      })
    )}
    {...defaultProps}
    {...rest}
  />
