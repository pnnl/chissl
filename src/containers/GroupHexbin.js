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

const GroupHexbin = ({data=[], group, color='lightgray'}) =>
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
          <HexbinPlot
            radius={10}
            style={{fill: 'none', stroke: 'black', strokeWidth: 1}}
            eachPath={d => ({
              style: {fill: sum(d, ({label}) => label === group)}
            })}
          />
        </Chart>
    }
  </ContainerDimensions>

export default connect(
  (state, {group}) => ({
    data: prepareDataForScatter(state),
    color: state.getIn([...GROUP_COLOR_PATH, group])
  })
)(GroupHexbin)
