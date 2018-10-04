import React from 'react'

import {VictoryLine} from 'victory'

export const TrajectoryComponent = ({coordinates=[], start, end, domain}) =>
  <VictoryLine
    width={75}
    height={75}
    padding={5}
    data={coordinates.slice(start, end)}
    x={0}
    y={1}
    sortKey={(_, i) => i}
  />
