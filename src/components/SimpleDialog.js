import React from 'react'

import Button from '@material-ui/core/Button';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class SimpleDialog extends React.Component {
  state = {
    open: false,
  };

  handleClickOpen = () => {
    const {onClick} = this.props;
    onClick && onClick();
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const {title='Title', cancel='Cancel', submit='Submit', button, children, onClick, actions, ...props} = this.props;

    return <div>
      { button
          ? React.cloneElement(button, {onClick: this.handleClickOpen})
          : <Button onClick={this.handleClickOpen}>
              Open form dialog
            </Button>
      }

      <Dialog
        open={this.state.open}
        onClose={this.handleClose}
        {...props}
      >
        <DialogTitle>
          { title }
        </DialogTitle>

        <DialogContent>
          { children }
        </DialogContent>

        { actions &&
          <DialogActions>
            <Button onClick={this.handleClose} color='secondary'>
              { cancel }
            </Button>
            <Button onClick={this.handleClose} color='primary'>
              { submit }
            </Button>
          </DialogActions>
        }
      </Dialog>
    </div>
  }
}

export default SimpleDialog