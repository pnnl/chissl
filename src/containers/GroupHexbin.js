import React from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import ContainerDimensions from 'react-container-dimensions'

import {getDendrogram, getPredictions} from '../selectors'

import {sum} from 'd3-array'

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

const GroupHexbin = ({data=[], group, color}) => {
  const getColor = d =>({
    fill: sum(d, d => d.group === group) > 0 ? color : 'none'
  });

  const getBorder = d =>
    sum(d, d => d.group === group && d.groupBefore !== group) > 0
      ? {strokeWidth: 3, stroke: 'black'}
      : null;

  return <ContainerDimensions>
    { ({ width }) =>
        <Chart
          width={width}
          height={width}
          margin={20}
          data={data}
          x='x'
          y='y'
        >
          <HexbinPlot
            radius={10}
            style={{stroke: 'darkgray', strokeWidth: 1}}
            eachPath={d => ({
              style: {...getColor(d),
                      ...getBorder(d)}
            })}
          />
        </Chart>
    }
  </ContainerDimensions>
}

export default connect(
  (state, {group}) => ({
    data: prepareDataForScatter(state),
    color: group === -1 ? 'lightgray' : state.getIn([...GROUP_COLOR_PATH, group])
  })
)(GroupHexbin)
