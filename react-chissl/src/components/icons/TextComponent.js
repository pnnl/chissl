
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

import React, {Component} from 'react';

import Popover from '@material-ui/core/Popover';

import {timeFormat} from 'd3-time-format';
import {scaleOrdinal} from 'd3-scale';
import {schemeCategory20 as scheme} from 'd3-scale';
// import {color} from 'd3-color';

import './TextComponent.css';

const colorScale = scaleOrdinal(scheme);

const format = timeFormat('%a %b %d, %Y');

const TextHeader = ({title, source, date, className='', onClick}) =>
  <div className={`text-header ${className}`} onClick={onClick}>
    <div className='title'>
      { onClick && <i className='fa fa-file-text'/> }
      { title }
    </div>

    <div className='subtitle'>
      { source && `${source}, ` }{ date && format(new Date(date)) }
      </div>
    
    <hr />
  </div>

class TextComponent extends Component {

  state = {open: false}

  handleClick = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  render() {
    const {source, title, content, tags, topics, date, n=5} = this.props;
    const {open} = this.state;

    return (
      <div className='text-component' ref={ele => this.anchorEl = ele}>

        <Popover
          open={open}
          anchorEl={this.anchorEl}
          onClose={this.handleClose}
        >
          <div className='text-content'>
            <TextHeader title={title} source={source} date={date} onClick={this.handleClose}/>

            <pre>
              {content}
            </pre>

          </div>
        </Popover>

        <TextHeader
          className='compact'
          title={title}
          date={date}
          onClick={this.handleClick}
        />

        <div>
          { topics
              .slice(0, n)
              .map((d,i) =>
                <div key={i} >
                  <div
                    className='topic'
                    style={{
                      backgroundColor: colorScale(d)
                    }}
                  />
                  {tags[i]}
               </div>
              )
          }
        </div>
      </div>
    );

  }
} 

export {TextComponent};