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
      model, labels={}, query={}, project={},
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
                  validate={d => d}
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
                  {model, labels, query, project}
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
              { ['labels', 'query', 'project'].map(d =>
                  <ListItem key={d}
                    className={classes.nested}
                  >
                    <ListItemText
                      primary={
                        <ValidatedTextArea
                          value={JSON.stringify(this.props[d] || {})}
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
    model: state.getIn([...SETUP_PATH, 'model']),
    labels: state.getIn([...SETUP_PATH, 'labels']),
    query: state.getIn([...SETUP_PATH, 'query']),
    project: state.getIn([...SETUP_PATH, 'project']),
    ...getCurrentNames(state)
  }),
  dispatch => bindActionCreators({
    onChange: createSetupAction,
    onCreate: createCreateModelAction
  }, dispatch)
)(withStyles(styles)(NewModelList))