import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import Snackbar from '@material-ui/core/Snackbar'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import CloseIcon from '@material-ui/icons/Close'
import InfoIcon from '@material-ui/icons/Info'

import {
  ERRORS_PATH,
  createDeleteErrorAction
} from '../actions/errors'

import SimpleDialog from '../components/SimpleDialog'

class ErrorSnackbar extends React.Component {
  state = {

  }

  handleCancel = () => {
    this.setState({open: undefined});
  }

  handleClose = value => () => {
    const {onClose} = this.props;
    onClose && onClose(value);
    this.setState({open: undefined});
  }

  handleOpen = open => () => {
    this.setState({open});
  }

  render() {
    const {data=Map(), onClose} = this.props;
    const {open} = this.state;

    const {message, config={}, response={}} = data.get(open, {});

    return <div>
      <SimpleDialog
        maxWidth='md'
        title={
          <ListItemText
            primary={`Error: ${message}`}
            secondary={config.url}
          />
        }
        open={open !== undefined}
        submit='Dismiss'
        cancel='Cancel'
        onClose={this.handleCancel}
        onSubmit={this.handleClose(open)}
      >
        <div dangerouslySetInnerHTML={{__html: response.data}} />
      </SimpleDialog>

      { data.map((v, k) =>
          <Snackbar
            key={k}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={true}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={
              <span>
                Error: 
                <Button
                  id="message-id"
                  color='secondary'
                  onClick={this.handleOpen(k)}
                >
                  { v.message }
                </Button>
              </span>
            }
            action={
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleClose(k)}
              >
                <CloseIcon />
              </IconButton>
            }
          />
        ).valueSeq()
      }
    </div>
  }
}

export default connect(
  state => ({
    data: state.getIn(ERRORS_PATH)
  }),
  dispatch => bindActionCreators({
    onClose: createDeleteErrorAction
  }, dispatch)
)(ErrorSnackbar)
