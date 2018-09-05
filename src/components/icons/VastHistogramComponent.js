import React from 'react'

import {
  VictoryChart,
  VictoryTooltip,
  VictoryScatter
} from 'victory'

import ButtonBase from '@material-ui/core/ButtonBase'
import Tooltip from '@material-ui/core/Tooltip'

import {mean} from 'd3-array'
import {nest} from 'd3-collection'
import {scaleOrdinal, scaleLinear, scaleLog} from 'd3-scale'
import {schemeCategory10} from 'd3-scale-chromatic'

import PopoverComponent from './PopoverComponent'

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

export const Trajectory = ({data, domain}) => {
  const aggregated_data = nest()
    .key(d => d.name)
    .rollup(leaves => {
      return {
        category: leaves[0].category,
        long: mean(leaves, d => d.long),
        lat: mean(leaves, d => d.lat),
        size: leaves.length
      }
    })
    .entries(data);

  aggregated_data.forEach(d => d.label = d.key);

  return <VictoryChart>
    <VictoryScatter
      width={300}
      height={300}
      padding={5}
      data={aggregated_data}
      domain={domain}
      x={d => d.value.long}
      y={d => d.value.lat}
      size={d => Math.log(d.value.size + 1)}
      style={{data: {fill: d => color(d.value.category)}}}
      labelComponent={<VictoryTooltip/>}
    />
  </VictoryChart>
}
const ActivityTimeHistogram = ({data=[], x, xDomain=[], y, yDomain=[]}) => {
  data = nest()
    .key(d => d[x])
    .key(d => d[y])
    .rollup(leaves => leaves.length)
    .map(data);

  const scale = scaleLog()
    .domain([1, 120])
    .range([3, diameter]);

  return <table style={{borderSpacing: 0}}>
    { yDomain.map(j =>
        <tr key={j}>
          { xDomain.map(i => {
              const v = data.get(i) && data.get(i).get(j)

              return <td key={i} style={outerStyle}>
                <Marker size={scale(v)} color={color(j)} title={`${j}: ${v}`}/>
              </td>
            })
          }
        </tr>
    )}
  </table>
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
