import React from 'react'

import {
  VictoryChart,
  VictoryTooltip,
  VictoryScatter,
  VictoryLine
} from 'victory'

import ButtonBase from '@material-ui/core/ButtonBase'
import Tooltip from '@material-ui/core/Tooltip'

import {range, mean} from 'd3-array'
import {nest} from 'd3-collection'
import {scaleOrdinal, scaleLinear, scaleLog, scaleSqrt} from 'd3-scale'
import {schemeCategory10} from 'd3-scale-chromatic'

import PopoverComponent from './PopoverComponent'

import namedPlaces from './namedPlaces.json'

const color = scaleOrdinal(schemeCategory10);

const diameter = 10;

const innerStyle = {
  borderRadius: 2,
  margin: 'auto',
};

const outerStyle = {
  minWidth: diameter,
  minHeight: diameter,
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: 1,
  lineHeight: 0,
}

const Marker = ({color, size, title}) =>
  size > 0
    ? <Tooltip title={title}>
        <ButtonBase>
          <div style={{width: diameter, height: diameter, backgroundColor: '#f5f5f5'}}>
            <div
              style={{
                ...innerStyle,
                minWidth: size,
                minHeight: size,
                maxWidth: size,
                maxHeight: size,
                backgroundColor: color,
              }}
            />
          </div>
        </ButtonBase>
      </Tooltip>
    : <div style={{minWidth: diameter, height: diameter}} />

export const Trajectory = ({location, trajectory, domain}) => {

  const sizeScale = scaleSqrt()
    .domain([1, 120])
    .range([1, 4]);

  location.forEach(d => d.label = d[0]);

  return <VictoryChart
    domain={domain}
  >
    <VictoryLine
      data={trajectory}
      x={0}
      y={1}
      sortKey={(_, i) => i}
    />
    <VictoryScatter
      data={location}
      x={d => namedPlaces[d[0]].long}
      y={d => namedPlaces[d[0]].lat}
      size={d => sizeScale(d[1])}
      style={{data: {fill: d => color(namedPlaces[d[0]].category)}}}
      labelComponent={<VictoryTooltip/>}
    />
  </VictoryChart>
}

const categories = [
  'Apartment',
  'Coffee',
  'Dining',
  'GASTech',
  'Gas',
  'Home',
  'Industrial',
  'Lodging',
  'Public',
  'Recreation',
  'Shopping'
]

const ActivityTimeHistogram = ({hour_category, diameter=10}) => {
  const width = diameter*12*2;
  const height = diameter*categories.length*2;

  const sizeScale = scaleLog()
    .domain([1, 120])
    .range([3, 0.9*diameter]);

  const yScale = scaleOrdinal()
    .domain(categories)
    .range(range(categories.length));

  hour_category.forEach(d => d.label = `${d[0]} ${d[1]}: ${d[2]}`)

  return <VictoryScatter
    width={width}
    height={height}
    padding={diameter}
    data={hour_category}
    x={0}
    y={d => yScale(d[1])}
    size={d => sizeScale(d[2])}
    style={{data: {strokeWidth: 0, fill: d => color(d[1])}}}
    domain={{
      y: [0, categories.length - 1],
      x: [0, 11]
    }}
    labelComponent={<VictoryTooltip/>}    
  />
}

export const VastHistogramComponent = ({CurrentEmploymentTitle, FullName, ...props}) =>
  <PopoverComponent
    title={FullName}
    subtitle={CurrentEmploymentTitle}
    detail={<Trajectory {...props} />}
    className='vast-component'
  >
    <ActivityTimeHistogram {...props} />
  </PopoverComponent>
