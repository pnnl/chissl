
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
import {createSelector} from 'reselect'
import {Map} from 'immutable'

import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse'
import List from '@material-ui/core/List'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';

import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import ValidatedTextArea from '../components/ValidatedTextArea'

import {
  getCurrentNames,
  createCreateModelAction
} from '../actions/api'

import {
  SETUP_PATH,
  createSetupAction
} from '../actions/setup'

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit * 4,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 6,
  },
});

class NewModelList extends React.Component {
  state = {}

  handleClick = () => {
    this.setState({ open: !this.state.open});
  };

  render() {
    const {
      application,
      model='', query='', project='',
      classes,
      onChange, onCreate,
    } = this.props;

    return application === undefined
      ? <div/>
      : <List
          subheader={
            <ListSubheader component='div'>
              Create a new model
            </ListSubheader>
          }
        >
          <ListItem
            onClick={this.handleClick}
          >
            <ListItemText
              primary={
                <ValidatedTextArea
                  value={model}
                  onChange={v => onChange('model', v)}
                >
                  <TextField
                    fullWidth
                    onClick={ev => ev.stopPropagation()}
                  />
                </ValidatedTextArea>
              }
            />

            <Button
              disabled={model === undefined || model === ''}
              variant='contained'
              color='primary'
              className={classes.button}
              onClick={ev => {
                ev.stopPropagation();
                onCreate(
                  application,
                  {model, query, project}
                );
              }}
            >
              Create
            </Button>

            {this.state.open? <ExpandLess /> : <ExpandMore />}
          </ListItem>

          <Collapse
            in={this.state.open}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              { ['query', 'project'].map(d =>
                  <ListItem key={d}
                    className={classes.nested}
                  >
                    <ListItemText
                      primary={
                        <ValidatedTextArea
                          value={this.props[d]}
                          onChange={v => onChange(d, v)}
                          validate={v => !v || JSON.parse(v)}
                        >
                          <TextField fullWidth multiline />
                        </ValidatedTextArea>
                      }
                      secondary={d}
                    />
                  </ListItem>
                )
              }
            </List>
          </Collapse>
        </List>
  }
}

export default connect(
  state => ({
    ...getCurrentNames(state),
    model: state.getIn([...SETUP_PATH, 'model']),
    labels: state.getIn([...SETUP_PATH, 'labels']),
    query: state.getIn([...SETUP_PATH, 'query']),
    project: state.getIn([...SETUP_PATH, 'project']),
  }),
  dispatch => bindActionCreators({
    onChange: createSetupAction,
    onCreate: createCreateModelAction
  }, dispatch)
)(withStyles(styles)(NewModelList))