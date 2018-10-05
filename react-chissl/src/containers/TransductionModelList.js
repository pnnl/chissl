
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

import {format} from 'd3-format';

import { withStyles } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green';

import CircularProgress from '@material-ui/core/CircularProgress';
import Avatar from '@material-ui/core/Avatar'
import Collapse from '@material-ui/core/Collapse'
import List from '@material-ui/core/List'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Button from '@material-ui/core/Button'

import ImportExportIcon from '@material-ui/icons/ImportExport'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'

import {
  getCurrentNames,
  createSetDatasetAction,
  createSetApplicationAction
} from '../actions/api'

import {createSetupAction} from '../actions/setup'

const withSi = format('.2s');
const formatAvatar = d => d < 1000 ? d : withSi(d);

const styles = theme => ({
  avatar: {
    color: '#fff',
    backgroundColor: green[500],
  },
  button: {
    marginRight: theme.spacing.unit * 4,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 6,
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

class ModelList extends React.Component {
  state = {}

  handleClick = k => () => {
    const {open} = this.state;
    this.setState({ open: open === k ? undefined : k });
  };

  render() {
    const {application, transduction=Map(), induction=Map(), onOpen, onClick, classes} = this.props;

    return transduction.size > 0 &&
      <List
      subheader={
        <ListSubheader component='div'>
          { `Select a model from: ${application}` }
        </ListSubheader>
      }
      >
        { transduction
            .sortBy(v => -(new Date(v.get('date'))))
            .map((v, k) => [
              <ListItem key={k}>
                {
                  v.has('error')
                    ? <Button color='secondary'>
                        <ErrorOutlineIcon />
                      </Button>
                    : v.has('size')
                      ? <Avatar className={classes.avatar}>
                          { formatAvatar(v.get('size')) }
                        </Avatar>
                      : <CircularProgress className={classes.progress}/>
                }

                <ListItemText
                  primary={k}
                  secondary={`${v.get('labels', Map()).size} // ${v.get('date')}`}
                />

                <ListItemIcon disabled={!induction.has(k)}>
                  <ImportExportIcon />
                </ListItemIcon>

                <Button
                  disabled={!v.has('size')}
                  variant='contained'
                  color='primary'
                  className={classes.button}
                  onClick={ev => {
                    ev.stopPropagation();
                    onOpen && onOpen(application, k)
                  }}
                >
                  Open
                </Button>

                <Button
                  disabled={
                    v.get('query', '') === '' &&
                    v.get('project', '') === ''
                  }
                  onClick={this.handleClick(k)}
                >
                  { this.state.open === k
                      ? <ExpandLess />
                      : <ExpandMore />
                  }
                </Button>
              </ListItem>,

              <Collapse key={`${k}-collapse`}
                in={this.state.open === k}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  { ['query', 'project']
                      .filter(d => v.get(d, '') !== '')
                      .map(d =>
                        <ListItem key={d}
                          button
                          className={classes.nested}
                          onClick={() => onClick && onClick(d, v.get(d))}
                        >
                          <ListItemText
                            primary={v.get(d)}
                            secondary={d}
                          />
                        </ListItem>
                      )
                  }
                </List>
              </Collapse>
            ]).valueSeq()
        }
      </List>
  }
}

export default connect(
  createSelector(
    [ state => state.getIn(['api', 'applications']),
      state => getCurrentNames(state)
    ],
    (applications=Map(), {application}) => ({
      application,
      transduction: applications.getIn([application, 'transduction']),
      induction: applications.getIn([application, 'induction']),
    })
  ),
  dispatch => bindActionCreators({
    onOpen: createSetDatasetAction,
    onClick: createSetupAction
  }, dispatch)
)(withStyles(styles)(ModelList))
