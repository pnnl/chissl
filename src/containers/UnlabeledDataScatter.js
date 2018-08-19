import React from 'react'
import {connect} from 'react-redux'

import ContainerDimensions from 'react-container-dimensions'

import {getPredictions} from '../selectors'

import {
  getModelPath
} from '../actions/api'

import Chart, {HexbinPlot, ScatterPlot} from '../charts'

const UnlabeledDataScatter = ({data=[], classes}) =>
  <ContainerDimensions>
    { ({ width }) =>
        <Chart
          width={width}
          height={width}
          margin={15}
          data={data}
          x={0}
          y={1}
        >
          <HexbinPlot
            radius={10}
            style={{fill: 'none', stroke: 'black', strokeWidth: 1}}
          />
        </Chart>
    }
  </ContainerDimensions>

export default connect(
  state => ({
    ...getPredictions(state),
    data: state.getIn(getModelPath('X'))
  })
)(UnlabeledDataScatter)
