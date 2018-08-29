import React, { Component } from "react"

import {geoPath, geoAlbersUsa} from 'd3-geo'

import world from '../../data/us-states.json'

const width = 150;
const height = 100;

const projection = geoAlbersUsa()
  .fitSize([width, height], world);

const path = geoPath()
  .projection(projection);

const stateStyle = {
  fill: '#f0f0f0',
  stroke: 'white',
  strokeWidth: 1,
};

const pathStyle = {
  fill: 'none',
  stroke: 'black',
  strokeWidth: 3
}

const MapTrajectoryComponent = ({coordinates}) =>
  <div style={{margin: 10}}>
    <svg width={width} height={height}>
      <g style={stateStyle}>
        {world.features.map((d, i) =>
          <path key={i} d={path(d)}/>
        )}
      </g>

      <path
        style={pathStyle}
        d={
          path({
            type: 'Feature',
            geometry: {type: 'LineString', coordinates}
          })
        }
      />
    </svg>
  </div>

export {MapTrajectoryComponent}
