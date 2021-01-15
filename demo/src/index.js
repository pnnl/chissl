import React, {Component} from 'react'
import {render} from 'react-dom'

import {Example} from '../../src'

class Demo extends Component {
  render() {
    return <div>
      <h1>chissl-widget Demo</h1>
      <div>
        A widget for interactive machine learning using CHISSL
      </div>
      <Example hello='world'/>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
