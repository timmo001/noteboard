import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Grow from '@material-ui/core/Grow';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Note from './Note';

const styles = theme => ({
  root: {
    height: '100%',
    width: '100%'
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: theme.spacing.unit
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
});

class Notes extends React.PureComponent {
  state = {
    showHeader: false
  };
  timeout;

  showHeader = () => this.setState({ showHeader: true });

  hideHeader = () => this.setState({ showHeader: false });

  timeoutHeader = () => {
    clearTimeout(this.timeout);
    this.showHeader();
    if (!this.state.controlsEntered)
      this.timeout = setTimeout(() => this.hideHeader(), 1200);
  };

  controlsEntered = () => this.setState({ controlsEntered: true });

  controlsLeft = () => this.setState({ controlsEntered: false });

  render() {
    const { classes, notes, logout, updateNote } = this.props;
    const { showHeader } = this.state;

    return (
      <main className={classes.root} onMouseMove={this.timeoutHeader}>
        <header
          className={classes.header}
          onMouseEnter={this.controlsEntered}
          onMouseLeave={this.controlsLeft}>
          <Grow in={showHeader}>
            <IconButton
              aria-label="Log Out"
              className={classes.margin}
              onClick={logout}>
              <ExitToAppIcon fontSize="small" />
            </IconButton>
          </Grow>
        </header>
        {notes ? (
          notes.map((note, id) => (
            <Note key={id} note={note} updateNote={updateNote} />
          ))
        ) : (
          <CircularProgress className={classes.progress} />
        )}
      </main>
    );
  }
}

Notes.propTypes = {
  classes: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  updateNote: PropTypes.func.isRequired,
  notes: PropTypes.array
};

export default withStyles(styles)(Notes);
