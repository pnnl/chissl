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
        { transduction.map((v, k) => [
            <ListItem key={k}
              onClick={this.handleClick(k)}
            >
              { v.has('size')
                  ? <Avatar className={classes.avatar}>
                      { formatAvatar(v.get('size')) }
                    </Avatar>
                  : <CircularProgress />
              }

              <ListItemText
                primary={k}
                secondary={`${v.get('labels').size} // ${v.get('date')}`}
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

              {this.state.open === k? <ExpandLess /> : <ExpandMore />}
            </ListItem>,

            <Collapse key={`${k}-collapse`}
              in={this.state.open === k}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                { ['query', 'project'].map(d =>
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
