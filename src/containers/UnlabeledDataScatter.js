import React from 'react'
import {connect} from 'react-redux'

import ContainerDimensions from 'react-container-dimensions'

import {getPredictions} from '../selectors'

import {
  getModelPath
} from '../actions/api'

import Chart, {ScatterPlot} from '../charts'

const UnlabeledDataScatter = ({data=[], classes}) =>
  <ContainerDimensions>
    { ({ width }) =>
        <Chart
          width={width}
          height={width}
          margin={10}
          data={data}
          x={0}
          y={1}
        >
          <ScatterPlot radius={d => 5}/>
        </Chart>
    }
  </ContainerDimensions>

export default connect(
  state => ({
    ...getPredictions(state),
    data: state.getIn(getModelPath('X'))
  })
)(UnlabeledDataScatter)
