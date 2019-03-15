import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Grow from '@material-ui/core/Grow';
import Fab from '@material-ui/core/Fab';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import Note from './Note';

const styles = () => ({
  root: {
    height: '100%',
    width: '100%'
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
  fab: {
    position: 'fixed',
    right: 16,
    bottom: 16
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
    const { classes, notes, logout, addNote, updateNote } = this.props;
    const { showHeader } = this.state;

    return (
      <div className={classes.root}>
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
        <main onMouseMove={this.timeoutHeader}>
          {notes ? (
            notes.map((note, id) => (
              <Note key={id} note={note} updateNote={updateNote} />
            ))
          ) : (
            <CircularProgress className={classes.progress} />
          )}
          <Fab
            className={classes.fab}
            color="primary"
            aria-label="Add"
            onClick={addNote}>
            <AddIcon />
          </Fab>
        </main>
      </div>
    );
  }
}

Notes.propTypes = {
  classes: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  addNote: PropTypes.func.isRequired,
  updateNote: PropTypes.func.isRequired,
  notes: PropTypes.array
};

export default withStyles(styles)(Notes);
