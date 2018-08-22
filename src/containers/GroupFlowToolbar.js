import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import FlowOutIcon from '@material-ui/icons/ChevronLeft'
import FlowInIcon from '@material-ui/icons/ChevronRight'

import {prepareDataForScatter} from './GroupHexbin'

import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip';

import {
  GROUP_COLOR_PATH,
  createShowMoreAction
} from '../actions/ui'


export const GroupFlowToolbar = ({group, direction, flow, colors=Map(), onClick}) =>
  flow === undefined
    ? <div />
    : <Toolbar style={{width: '100%'}}>
        { direction === 'from'
            ? <FlowInIcon />
            : <FlowOutIcon />
        }
        { (flow || new Map())
            .entries()
            .map(({key, value}) =>
              <Tooltip title={`${direction} ${key === '-1' ? 'unlabeled' : key}`}>
                <Button
                  size='small'
                  variant={key === '-1' ? 'outlined' : 'contained'}
                  onClick={() => onClick && onClick(value)}
                  style={{backgroundColor: colors.get(key)}}
                >
                  {value.length}
                </Button>
              </Tooltip>
            )
        }

      </Toolbar>

export default connect(
  (state, {group, direction}) => ({
    flow: prepareDataForScatter(state).flow[direction].get(group),
    colors: state.getIn(GROUP_COLOR_PATH)
  }),
  dispatch => bindActionCreators({
    onClick: createShowMoreAction
  }, dispatch)
)(GroupFlowToolbar)
