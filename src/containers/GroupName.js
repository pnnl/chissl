import React from 'react'
import {connect} from 'react-redux'

import {debounce} from 'lodash'

import TextField from '@material-ui/core/TextField'

import {createAction} from '../actions'

import {createRenameGroupAction} from '../actions/labeling'

class GroupNameContainer extends React.Component {
  state = {
    value: ''
  }

  emitChange = debounce(value => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(value);
    }
  }, 250)

  handleChange = ev => {
    const value = ev.target.value;
    this.setState({value});
    this.emitChange(value);
  }

  handleNewProps = props => {
    const {value=''} = props;
    this.setState({value});
  }

  componentWillReceiveProps(nextProps) {
    this.handleNewProps(nextProps);
  }

  componentDidMount() {
    this.handleNewProps(this.props);
  }

  componentWillUnMount() {
    this.emitChange.cancel();
  }

  render() {
    return <TextField
      {...this.props}
      {...this.state}
      onChange={this.handleChange}
    />
  }
}

export default connect(
  null,
  (dispatch, {value}) => ({
    onChange: newValue => dispatch(createRenameGroupAction(value, newValue))
  })
)(GroupNameContainer)