import React from 'react'

import {scaleLinear} from 'd3-scale'
import {extent} from 'd3-array'
import {hexbin} from 'd3-hexbin'

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

export const createAccessor = (field, missingDataValue) =>
  typeof(field) !== 'function'
    ? d => field in d ? d[field] : missingDataValue
    : field

export const createScale = (data, func, scale=scaleLinear) => {
  let [min, max] = extent(data, func);

  return min === max
    ? constScale(min)
    : scale().domain([min, max])
}

export const ScatterPlot = ({data, x, y, xScale, yScale, r, size=10}) => {

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

export const HexbinPlot = ({data, x, y, xScale, yScale, radius, ...props}) => {
  const [xmin, xmax] = xScale.range();
  const [ymin, ymax] = yScale.range();

  const bins = hexbin()
    .radius(radius)
    .extent([[xmin, ymin], [xmax - xmin, ymax - ymin]])
    .x((d, i) => xScale(x(d, i)))
    .y((d, i) => yScale(y(d, i)));

  return <g {...props}>
    { bins(data).map(({x, y}, i) =>
        <path
          key={i}
          transform={`translate(${x}, ${y})`}
          d={bins.hexagon()}
        />
      )
    }
  </g>
}
const Chart = ({data=[], width, height, x, y, margin=0, children, ...props}) => {
  const {
    top=margin,
    left=margin,
    bottom=margin,
    right=margin
  } = typeof(margin) === 'number'
    ? {}
    : margin;

  const xScale = createScale(data, x = createAccessor(x))
    .range([left, width - right]);

  const yScale = createScale(data, y = createAccessor(y))
    .range([height - bottom, top]);

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

export default Chart
