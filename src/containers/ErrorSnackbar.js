import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Map} from 'immutable'

import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'

import CloseIcon from '@material-ui/icons/Close'

import {
  ERRORS_PATH,
  createDeleteErrorAction
} from '../actions/errors'

export const ErrorSnackbar = ({data=Map(), onClose}) =>
  <div>
    { data.map((v, k) => {
        const handleClose = () => onClose && onClose(k);

        return <Snackbar
          key={k}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={true}
          onClose={handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">Error: </span>}
          action={
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          }
        />
      }).valueSeq()
    }
    </div>

export default connect(
  state => ({
    data: state.getIn(ERRORS_PATH)
  }),
  dispatch => bindActionCreators({
    onClose: createDeleteErrorAction
  }, dispatch)
)(ErrorSnackbar)
