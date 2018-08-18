import React from 'react'
import {debounce} from 'lodash'

class ValidatedTextArea extends React.Component {
  state = {}

  handleValidate = debounce(emit => {
    const {value} = this.state;
    const {onChange, validate} = this.props;

    try {
      emit && onChange(validate(value));
      this.setState({error: undefined});
    } catch(exn) {
      this.setState({error: String(exn)});
    }
  }, 100)

  handleSetValue = (value, emit) => {
    this.setState({value});
    this.handleValidate(emit);
  }

  handleChange = ev =>
    this.handleSetValue(ev.target.value, true)

  componentDidMount() {
    this.handleSetValue(this.props.value);
  }

  componentWillReceiveProps(nextProps) {
    this.handleSetValue(nextProps.value);
  }

  componentWillUnmount() {
    this.handleValidate.cancel();
  }

  render() {
    const {value='', error} = this.state;
    const {children} = this.props;

    const props = {
      value,
      error: error !== undefined,
      label: error,
      onChange: this.handleChange
    };

    return React.cloneElement(children, props)
  }
}

export default ValidatedTextArea
