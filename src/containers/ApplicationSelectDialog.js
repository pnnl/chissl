import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import Grid from '@material-ui/core/Grid'

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import SimpleDialog from '../components/SimpleDialog'

import {createListApplicationsAction} from '../actions/api'

import ApplicationList from './ApplicationList'
import TransductionModelList from './TransductionModelList'
import NewModelList from './NewModelList'

import {
  OPEN_APPLICATIONS_PATH,
  createOpenApplicationsAction,
} from '../actions/ui'


const ModelPicker = ({dispatch, ...props}) =>
  <SimpleDialog
    fullWidth
    maxWidth='md'
    title='Transduction Models'
    {...props}
  >
    <Grid container spacing={16}>
      <Grid item xs={12} sm={4}>
        <ApplicationList />
      </Grid>

      <Grid item xs={12} sm={8}>
        <TransductionModelList />
        <NewModelList />
      </Grid>
    </Grid>

  </SimpleDialog>

export default connect(
  state => ({
    open: state.getIn(OPEN_APPLICATIONS_PATH)
  }),
  dispatch => bindActionCreators({
    onClose: createOpenApplicationsAction
  }, dispatch)
)(ModelPicker)
