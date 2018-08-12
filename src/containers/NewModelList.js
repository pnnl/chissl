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
  getCurrentApplication,
} from '../actions/api'

import {
  CLIPBOARD_PATH,
  createClipboardAction
} from '../actions/clipboard'

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
    const {currentApplication, classes, onChange, ...props} = this.props;

    return currentApplication === undefined
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
                <TextField fullWidth onClick={ev => ev.stopPropagation()}/>
              }
            />

            <Button
              variant='contained'
              color='primary'
              className={classes.button}
              onClick={ev => {
                ev.stopPropagation();
                console.log('Create')
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
              { ['labels', 'query', 'project'].map(d =>
                  <ListItem key={d}
                    className={classes.nested}
                  >
                    <ListItemText
                      primary={
                        <ValidatedTextArea
                          value={JSON.stringify(props[d] || {})}
                          onChange={v => onChange(d, v)}
                          validate={JSON.parse}
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
    labels: state.getIn([...CLIPBOARD_PATH, 'labels']),
    query: state.getIn([...CLIPBOARD_PATH, 'query']),
    project: state.getIn([...CLIPBOARD_PATH, 'project']),
    currentApplication: getCurrentApplication(state)
  }),
  dispatch => bindActionCreators({
    onChange: createClipboardAction
  }, dispatch)
)(withStyles(styles)(NewModelList))