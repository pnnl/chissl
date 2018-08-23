import React from 'react'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const SimpleDialog = ({title='Title', cancel, submit, button, children, onClose, onSubmit, ...props}) =>
  <Dialog
    {...props}
    onClose={() => onClose && onClose()}
  >
    <DialogTitle>
      { title }
    </DialogTitle>

    <DialogContent>
      { children }
    </DialogContent>

    { (cancel || submit) &&
      <DialogActions>
        { cancel &&
          <Button onClick={() => onClose && onClose()} color='secondary' variant='outlined'>
            { cancel }
          </Button>
        }
        { submit &&
          <Button onClick={() => onSubmit && onSubmit()} color='primary' variant='contained'>
            { submit }
          </Button>
        }
      </DialogActions>
    }
  </Dialog>

export default SimpleDialog