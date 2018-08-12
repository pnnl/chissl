import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import Grid from '@material-ui/core/Grid'

import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import SimpleDialog from '../components/SimpleDialog'

import {createListApplicationsAction} from '../actions/api'

import ApplicationList from './ApplicationList'
import TransductionModelList from './TransductionModelList'

class ModelPicker extends React.Component {
  render() {
    return   <SimpleDialog
      submit='Create'
      fullWidth
      maxWidth='md'
      title='Transduction Models'
      {...this.props}
    >
      <Grid container spacing={16}>
        <Grid item xs={12} sm={4}>
            <ApplicationList />
        </Grid>

        <Grid item xs={12} sm={8}>
          <TransductionModelList />
        </Grid>
      </Grid>

    </SimpleDialog>
  }
} 

export default connect(
  null,
  dispatch => bindActionCreators({
    onClick: createListApplicationsAction
  }, dispatch)
)(ModelPicker)
