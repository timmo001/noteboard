import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
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
    left: 0,
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
    showOverlays: false
  };
  timeout;

  componentDidUpdate = newProps => {
    if (this.props.notes !== newProps.notes) {
      this.forceUpdate();
      setTimeout(() => this.forceUpdate(), 200);
    }
  };

  showOverlays = () => this.setState({ showOverlays: true });

  hideOverlays = () => this.setState({ showOverlays: false });

  timeoutOverlays = () => {
    clearTimeout(this.timeout);
    this.showOverlays();
    if (!this.state.overlayEntered)
      this.timeout = setTimeout(() => this.hideOverlays(), 1200);
  };

  overlayEntered = () => this.setState({ overlayEntered: true });

  overlayLeft = () => this.setState({ overlayEntered: false });

  render() {
    const {
      classes,
      notes,
      logout,
      addNote,
      updateNote,
      deleteNote
    } = this.props;
    const { showOverlays } = this.state;

    return (
      <div className={classes.root} onMouseMove={this.timeoutOverlays}>
        <header
          className={classes.header}
          onMouseEnter={this.overlayEntered}
          onMouseLeave={this.overlayLeft}>
          <Slide direction="down" in={showOverlays}>
            <IconButton
              aria-label="Log Out"
              className={classes.margin}
              onClick={logout}>
              <ExitToAppIcon fontSize="small" />
            </IconButton>
          </Slide>
        </header>
        <main>
          {notes ? (
            notes.map((note, id) => (
              <Note
                key={id}
                note={note}
                updateNote={updateNote}
                deleteNote={deleteNote}
              />
            ))
          ) : (
            <CircularProgress className={classes.progress} />
          )}
          <Slide direction="up" in={showOverlays}>
            <Fab
              className={classes.fab}
              color="primary"
              aria-label="Add"
              onMouseEnter={this.overlayEntered}
              onMouseLeave={this.overlayLeft}
              onClick={addNote}>
              <AddIcon />
            </Fab>
          </Slide>
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
  deleteNote: PropTypes.func.isRequired,
  notes: PropTypes.array
};

export default withStyles(styles)(Notes);
