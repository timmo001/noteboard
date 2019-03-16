import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = theme => ({
  root: {
    minWidth: 320,
    background: theme.palette.main
  }
});

class ConfirmDialog extends React.PureComponent {
  state = {
    open: true
  };

  handleClose = () => this.setState({ open: false }, this.props.handleClose());

  handleConfirm = () => {
    this.handleClose();
    this.props.handleConfirm();
  };

  render() {
    const { classes, text } = this.props;
    const { open } = this.state;

    return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={this.handleClose}>
        <div className={classes.root}>
          <DialogTitle id="alert-dialog-title">Are you sure?</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {text}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              No
            </Button>
            <Button onClick={this.handleConfirm} color="primary" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    );
  }
}

ConfirmDialog.propTypes = {
  text: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired
};

export default withStyles(styles)(ConfirmDialog);
