
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

import './PopoverComponent.css';

const Header = ({title, subtitle, className='', onClick}) =>
  <div className={`popover-header ${className}`} onClick={onClick}>
    <div className='title'>
      <i className='fa fa-file-text'/>
      { title }
    </div>

    <div className='subtitle'>
      { subtitle }
    </div>
  </div>

class PopoverComponent extends Component {

  state = {open: false}

  handleClick = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  render() {
    const {detail, className='', children} = this.props;
    const {open} = this.state;

    return (
      <div className={`popover-component ${className}`} ref={ele => this.anchorEl = ele}>

        <Popover
          open={open}
          anchorEl={this.anchorEl}
          onClose={this.handleClose}
        >
          <Header {...this.props} onClick={this.handleClose}/>

          <div className='popover-content'>
            { open && detail /* todo: give this a delay with debounce */}
          </div>
          
        </Popover>

        <Header
          {...this.props}
          className='compact'
          onClick={this.handleClick}
        />

        <div>
          { children }
        </div>
      </div>
    );

  }
} 

export default PopoverComponent
