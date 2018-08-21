import React from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'
import {Map} from 'immutable'

import ContainerDimensions from 'react-container-dimensions'

import {getDendrogram, getPredictions} from '../selectors'

import {nest} from 'd3-collection'
import {scan, sum} from 'd3-array'

import {
  getModelPath
} from '../actions/api'

import {
  GROUP_COLOR_PATH
} from '../actions/ui'

import Chart, {HexbinPlot, ScatterPlot} from '../charts'

export const prepareDataForScatter = createSelector(
  [ getDendrogram,
    getPredictions,
    state => state.getIn(getModelPath('X'))
  ],
  ({instances}, {previousClasses, classes}, position) =>
    instances.map((_id, i) => ({
      _id, i,
      x: position[i][0],
      y: position[i][1],
      group: classes[i],
      groupBefore: previousClasses[i]
    }))
)

const HexbinBase = ({data=[], ...props}) =>
  <ContainerDimensions>
    { ({ width }) =>
        <Chart
          width={width}
          height={width}
          margin={20}
          data={data}
          x='x'
          y='y'
        >
          <HexbinPlot {...props} />
        </Chart>
    }
  </ContainerDimensions>


const getBinSummary = data => {
  const counts = nest()
    .key(d => d.group)
    .rollup(leaves => leaves.length)
    .entries(data);

  const {key, value} = counts[scan(counts, (a, b) => b.value - a.value)];
  const total = sum(counts, d => d.value);

  return {key, value: value/total};
}

const OverviewHexbinComponent = ({data=[], colors=Map()}) => {
  const getStyles = d => {
    const {key, value} = getBinSummary(d);

    return {
      style: {
        fill: colors.get(key, 'none'),
        fillOpacity: value
      }
    };
  }

  return <HexbinBase
    data={data}
    style={{stroke: 'darkgray', strokeWidth: 1}}
    eachPath={getStyles}
  />
}

export const OverviewHexbin = connect(
  (state, {group}) => ({
    data: prepareDataForScatter(state),
    colors: state.getIn(GROUP_COLOR_PATH)
  })
)(OverviewHexbinComponent)

const GroupHexbinComponent = ({data=[], group, color}) => {
  const getColor = d =>({
    fill: sum(d, d => d.group === group) > 0 ? color : 'none'
  });

  const getBorder = d =>
    sum(d, d => d.group === group && d.groupBefore !== group) > 0
      ? {strokeWidth: 3, stroke: 'black'}
      : null;

  return <HexbinBase
    data={data}
    style={{stroke: 'darkgray', strokeWidth: 1}}
    eachPath={d => ({
      style: {
        ...getBorder(d),
        ...getColor(d)
      }
    })}
  />
}

export const GroupHexbin = connect(
  (state, {group}) => ({
    data: prepareDataForScatter(state),
    color: group === -1 ? 'lightgray' : state.getIn([...GROUP_COLOR_PATH, group])
  })
)(GroupHexbinComponent)

export default HexbinBase
