import React from 'react'

import {VictoryLine} from 'victory'

export const TrajectoryComponent = ({coordinates}) =>
  <VictoryLine
    width={75}
    height={75}
    padding={5}
    data={coordinates}
    x={0}
    y={1}
  />
