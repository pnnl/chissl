import React, { Component } from "react"

import {geoPath, geoEqualEarth, geoAlbersUsa} from 'd3-geo'

// import world from '../../data/world-110m.geo.json'

const width = 150;
const height = 100;

const stateStyle = {
  fill: '#f0f0f0',
  stroke: 'white',
  strokeWidth: 1,
};

const pathStyle = {
  fill: 'none',
  stroke: 'black',
  strokeWidth: 1
}

const MapTrajectoryComponent = ({coordinates}) => {
  const features = {
    type: 'Feature',
    geometry: {type: 'LineString', coordinates}
  };

  const projection = geoEqualEarth()
    .fitSize([width, height], features);

  const path = geoPath()
    .projection(projection);

  return <div style={{margin: 10}}>
    <svg width={width} height={height}>
      <text
        x={5} y={15}
        style={{fill: 'lightgray'}}
      >
        {coordinates.length}
      </text>

      {/*

      <g style={stateStyle}>
        {world.features.map((d, i) =>
          <path key={i} d={path(d)}/>
        )}
      </g>

      */}

      <path
        style={pathStyle}
        d={path(features)}
      />
    </svg>
  </div>
}

export {MapTrajectoryComponent}
