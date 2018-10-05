
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
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import CloseIcon from '@material-ui/icons/Close'
import InfoIcon from '@material-ui/icons/Info'

import {
  ERRORS_PATH,
  createDeleteErrorAction
} from '../actions/errors'

import SimpleDialog from '../components/SimpleDialog'

class ErrorSnackbar extends React.Component {
  state = {

  }

  handleCancel = () => {
    this.setState({open: undefined});
  }

  handleClose = value => () => {
    const {onClose} = this.props;
    onClose && onClose(value);
    this.setState({open: undefined});
  }

  handleOpen = open => () => {
    this.setState({open});
  }

  render() {
    const {data=Map(), onClose} = this.props;
    const {open} = this.state;

    const {message, config={}, response={}} = data.get(open, {});

    return <div>
      <SimpleDialog
        maxWidth='md'
        title={
          <ListItemText
            primary={`Error: ${message}`}
            secondary={config.url}
          />
        }
        open={open !== undefined}
        submit='Dismiss'
        cancel='Cancel'
        onClose={this.handleCancel}
        onSubmit={this.handleClose(open)}
      >
        <div dangerouslySetInnerHTML={{__html: response.data}} />
      </SimpleDialog>

      { data.map((v, k) =>
          <Snackbar
            key={k}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={true}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={
              <span>
                Error: 
                <Button
                  id="message-id"
                  color='secondary'
                  onClick={this.handleOpen(k)}
                >
                  { v.message }
                </Button>
              </span>
            }
            action={
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleClose(k)}
              >
                <CloseIcon />
              </IconButton>
            }
          />
        ).valueSeq()
      }
    </div>
  }
}

export default connect(
  state => ({
    data: state.getIn(ERRORS_PATH)
  }),
  dispatch => bindActionCreators({
    onClose: createDeleteErrorAction
  }, dispatch)
)(ErrorSnackbar)
