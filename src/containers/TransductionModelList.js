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

import WifiIcon from '@material-ui/icons/Wifi'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'

import {
  getCurrentApplication,
  createSetApplicationAction
} from '../actions/api'

import {createClipboardAction} from '../actions/clipboard'

const styles = theme => ({
  button: {
    marginRight: theme.spacing.unit * 4,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 6,
  },
});

class ModelList extends React.Component {
  state = {}

  handleClick = k => () => {
    const {open} = this.state;
    this.setState({ open: open === k ? undefined : k });
  };

  render() {
    const {currentApplication, transduction=Map(), induction=Map(), onOpen, onClick, classes} = this.props;

    return transduction.size > 0 &&
      <List
      subheader={
        <ListSubheader component='div'>
          { `Select a model from: ${currentApplication}` }
        </ListSubheader>
      }
      >
        { transduction.map((v, k) => [
            <ListItem key={k}
              onClick={this.handleClick(k)}
            >
              <ListItemIcon disabled={!induction.has(k)}>
                <WifiIcon />
              </ListItemIcon>

              <ListItemText
                primary={k}
                secondary={`${v.get('labels').size} // ${v.get('date')}`}
              />

              <Button
                variant='contained'
                color='primary'
                className={classes.button}
                onClick={ev => {
                  ev.stopPropagation();
                  onOpen && onOpen(currentApplication, k)
                }}
              >
                Open
              </Button>

              {this.state.open === k? <ExpandLess /> : <ExpandMore />}
            </ListItem>,

            <Collapse key={`${k}-collapse`}
              in={this.state.open === k}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                { ['labels', 'query', 'project'].map(d =>
                    <ListItem key={d}
                      button
                      className={classes.nested}
                      onClick={() => onClick && onClick(d, v.get(d).toJS())}
                    >
                      <ListItemText
                        primary={JSON.stringify(v.get(d).toJS())}
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
      getCurrentApplication
    ],
    (applications=Map(), currentApplication) => ({
      currentApplication,
      transduction: applications.getIn([currentApplication, 'transduction']),
      induction: applications.getIn([currentApplication, 'induction']),
    })
  ),
  dispatch => bindActionCreators({
    // onOpen: 
    onClick: createClipboardAction
  }, dispatch)
)(withStyles(styles)(ModelList))
