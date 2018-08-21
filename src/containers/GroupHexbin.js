import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'
import {Map} from 'immutable'

import ContainerDimensions from 'react-container-dimensions'

import {getDendrogram, getPredictions} from '../selectors'

import {nest} from 'd3-collection'
import {scan, sum} from 'd3-array'

import {scaleSequential} from 'd3-scale'
import {interpolatePRGn as interpolateDivergent} from 'd3-scale-chromatic'

import {
  getModelPath
} from '../actions/api'

import {
  GROUP_COLOR_PATH,
  createShowMoreAction
} from '../actions/ui'

import Chart, {HexbinPlot, ScatterPlot} from '../charts'

export const prepareDataForScatter = createSelector(
  [ getDendrogram,
    getPredictions,
    state => state.getIn(getModelPath('X'))
  ],
  ({instances}, {previousClasses, classes}, position) =>{
    const data = instances.map((_id, i) => ({
      _id, i,
      x: position[i][0],
      y: position[i][1],
      group: classes[i],
      groupBefore: previousClasses[i]
    }));

    const delta = sum(data, ({groupBefore, group}) => groupBefore != group);

    const colorScale = scaleSequential(interpolateDivergent)
      .domain([-delta, delta]);

    return {data, colorScale};
  }
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

const OverviewHexbinComponent = ({data=[], colors=Map(), onClick}) => {
  const getStyles = d => {
    const {key, value} = getBinSummary(d);

    return {
      onClick: () => onClick(d.map(({_id}) => _id)),
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
    ...prepareDataForScatter(state),
    colors: state.getIn(GROUP_COLOR_PATH)
  }),
  dispatch => bindActionCreators({
    onClick: createShowMoreAction
  }, dispatch)
)(OverviewHexbinComponent)

const GroupHexbinComponent = ({data=[], group, colorScale}) => {
  const signum = (d) => {
    if (group === d.group && group !== d.groupBefore) {
      return 1;
    } else if (group !== d.group && group === d.groupBefore) {
      return -1;
    } else {
      return 0;
    }
  }

  const getStyle = d => {
    const delta = sum(d, signum);

    return {
      style: {
        fill: colorScale(delta),
        stroke: 'darkgray',
        strokeWidth: delta !== 0 ? 1 : 0
      }
    };
  }

  console.log('GroupHexbin', data)

  return <HexbinBase
    data={data}
    style={{stroke: 'darkgray', strokeWidth: 1}}
    eachPath={getStyle}
  />
}

export const GroupHexbin = connect(
  prepareDataForScatter
)(GroupHexbinComponent)

export default HexbinBase
