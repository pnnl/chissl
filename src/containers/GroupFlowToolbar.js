import React from 'react'
import {connect} from 'react-redux'

import {prepareDataForScatter} from './GroupHexbin'

import Toolbar from '@material-ui/core/Toolbar'

export const GroupFlowToolbar = () =>
  <Toolbar>
  </Toolbar>

export default connect(
  
)(GroupFlowToolbar)
