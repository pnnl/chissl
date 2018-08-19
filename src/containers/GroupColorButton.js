import React from 'react'
import {connect} from 'react-redux'
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color'

import {color as colorParser, rgba} from 'd3-color'

import {debounce, throttle} from 'lodash'

import {
  GROUP_COLOR_PATH,
  createSetGroupColorAction
} from '../actions/ui'

export const defaultColor = '#000000';

// Adapted from example:
// https://casesandberg.github.io/react-color/

class ColorButton extends React.Component {
  state = {
    displayColorPicker: false,
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  emitChange = () => {
    const {onChange} = this.props;
    const {color} = this.state;

    if (onChange) {
      onChange(color);
    }
  }

  throttleEmitChange = debounce(this.emitChange, 200)

  handleChange = (color) => {
    this.setState({color: color.hex});
    this.throttleEmitChange();
  };

  handleDefaultColor(props) {
    const {color=defaultColor} = props;
    this.setState({color});
  }

  componentDidMount() {
    this.handleDefaultColor(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.handleDefaultColor(nextProps);
  }

  render() {

    const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: this.state.color,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

    const {color, onChange, Picker=SketchPicker, ...props} = this.props;

    return (
      <div {...props}>
        <div style={ styles.swatch } onClick={ this.handleClick }>
          <div style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <Picker color={ color } onChange={ this.handleChange } />
        </div> : null }

      </div>
    )
  }
}

export default connect(
  (state, {group}) => ({
    color: state.getIn([...GROUP_COLOR_PATH, group])
  }),
  (dispatch, {group}) => ({
    onChange: value => dispatch(createSetGroupColorAction(group, value))
  })
)(ColorButton)
