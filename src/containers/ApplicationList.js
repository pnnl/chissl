import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem'
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemText from '@material-ui/core/ListItemText'

import {
  getCurrentApplication,
  createSetApplicationAction
} from '../actions/api'

export const ApplicationList = ({applications=Map(), value, onClick}) =>
  <MenuList
    subheader={
      <ListSubheader component='div'>
        Select an application
      </ListSubheader>
    }
  >
    { applications.map((v, k) =>
        <MenuItem
          key={k}
          selected={k === value}
          onClick={() => onClick && onClick(k)}
        >
          <ListItemText
            primary={k}
            secondary={`${v.get('collection')} // ${v.get('pipeline')}`}
          />
        </MenuItem>
      ).valueSeq()
    }
  </MenuList>

export default connect(
  state => ({
    applications: state.getIn(['api', 'applications']),
    value: getCurrentApplication(state)
  }),
  dispatch => bindActionCreators({
    onClick: createSetApplicationAction
  }, dispatch)
)(ApplicationList)
