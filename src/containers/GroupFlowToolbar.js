import React from 'react'
import {connect} from 'react-redux'

import Collapse from '@material-ui/core/Collapse'

import FlowOutIcon from '@material-ui/icons/ChevronLeft'
import FlowInIcon from '@material-ui/icons/ChevronRight'

import {prepareDataForScatter} from './GroupHexbin'

import Toolbar from '@material-ui/core/Toolbar'

export const GroupFlowToolbar = ({group, direction, flow}) =>
  flow === undefined
    ? <div />
    : <Toolbar>
        { (flow || new Map())
            .entries()
            .map(({key, value}) =>
              <span>{key} -> {value.length}</span>
            )
        }
        { direction === 'in'
            ? <FlowInIcon />
            : <FlowOutIcon />
        }
      </Toolbar>

export default connect(
  (state, {group, direction}) => ({
    flow: prepareDataForScatter(state).flow[direction].get(group)
  })
)(GroupFlowToolbar)
