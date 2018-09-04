import React from 'react'

import ButtonBase from '@material-ui/core/ButtonBase'
import Tooltip from '@material-ui/core/Tooltip'

import {nest} from 'd3-collection'
import {scaleOrdinal, scaleLinear} from 'd3-scale'
import {schemeCategory10} from 'd3-scale-chromatic'

import PopoverComponent from './PopoverComponent'

const color = scaleOrdinal(schemeCategory10);

const diameter = 8;

const innerStyle = {
  borderRadius: 2,
  margin: 'auto',
};

const outerStyle = {
  minWidth: diameter,
  minHeight: diameter,
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: 1
}

const Marker = ({color, size, title}) =>
  size > 0
    ? <Tooltip title={title}>
        <div style={{width: '100%', height: '100%', backgroundColor: '#f5f5f5'}}>
          <ButtonBase>
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
          </ButtonBase>
        </div>
      </Tooltip>
    : <div style={{minWidth: diameter, height: diameter}} />



const ActivityTimeHistogram = ({data=[], x, xDomain=[], y, yDomain=[]}) => {
  data = nest()
    .key(d => d[x])
    .key(d => d[y])
    .rollup(leaves => leaves.length)
    .map(data);

  const scale = scaleLinear()
    .domain([0, 120])
    .range([0, diameter]);

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
    detail={<div>TODO: map of movement with map of abila</div>}
    className='vast-component'
  >
    <ActivityTimeHistogram {...props} />
  </PopoverComponent>
