import React from 'react'
import {connect} from 'react-redux'

import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'

import ContainerDimensions from 'react-container-dimensions'

import {getPredictions} from '../selectors'

import {
  getModelPath
} from '../actions/api'

const constScale = value => {
  function scale() {
    return value;
  }

  scale.range = (...args) =>
    args.length
      ? scale
      : [value, value];

  return scale;
}

const createAccessor = (field, missingDataValue) =>
  typeof(field) !== 'function'
    ? d => field in d ? d[field] : missingDataValue
    : field

const createScale = (data, func, scale=scaleLinear) => {
  let [min, max] = extent(data, func);

  return min === max
    ? constScale(min)
    : scale().domain([min, max])
}
const Chart = ({data=[], width, height, x, y, margin, children, ...props}) => {
  const xScale = createScale(data, x = createAccessor(x))
    .range([0, width]);

  const yScale = createScale(data, y = createAccessor(y))
    .range([height, 0]);

  const childProps = {
    data, width, height, x, y, xScale, yScale, ...props
  }

  return <svg width={width} height={height}>
    { React.Children.map(children, child =>
        React.cloneElement(child, childProps)
      ) 
    }
  </svg>
}

const ScatterPlot = ({data, x, y, xScale, yScale, r, size=10}) => {

  const rScale = createScale(data, r = createAccessor(r, 1))
    .range(1, size)

  return <g>
    { data.map((d, i) =>
        <circle
          key={i}
          cx={xScale(x(d, i))}
          cy={yScale(y(d, i))}
          r={rScale(r(d, i))}
        />
      )
    }
  </g>
}

const UnlabeledDataScatter = ({data=[], classes}) =>
  <ContainerDimensions>
    { ({ width }) =>
        <Chart
          width={width}
          height={width}
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
