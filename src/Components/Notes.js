import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import FormatPaintIcon from '@material-ui/icons/FormatPaint';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddIcon from '@material-ui/icons/Add';
import Note from './Note';

const styles = theme => ({
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
  menu: {
    background: theme.palette.main
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
    showOverlays: false,
    anchorEl: null
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

  handleThemeClick = event => {
    if (this.props.editing) {
      this.props.handleEditItem(['theme']);
    } else this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = value =>
    this.setState({ anchorEl: null }, () => {
      typeof value === 'number' &&
        this.props.setTheme(this.props.themes[value].id);
    });

  render() {
    const {
      classes,
      theme,
      themes,
      notes,
      logout,
      addNote,
      updateNote,
      deleteNote
    } = this.props;
    const { showOverlays, anchorEl } = this.state;

    return (
      <div className={classes.root} onMouseMove={this.timeoutOverlays}>
        <Slide direction="down" in={showOverlays}>
          <header
            className={classes.header}
            onMouseEnter={this.overlayEntered}
            onMouseLeave={this.overlayLeft}>
            <Tooltip title="Log Out">
              <IconButton
                aria-label="Log Out"
                className={classes.margin}
                onClick={logout}>
                <ExitToAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Theme">
              <IconButton
                className={classes.margin}
                aria-label="Theme"
                aria-owns={anchorEl ? 'simple-menu' : null}
                aria-haspopup="true"
                onClick={this.handleThemeClick}>
                <FormatPaintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              classes={{ paper: classes.menu }}
              disableAutoFocusItem
              id="theme"
              value={theme}
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}>
              {themes.map((theme, x) => {
                return (
                  <MenuItem key={x} onClick={() => this.handleClose(x)}>
                    {theme.name}
                  </MenuItem>
                );
              })}
            </Menu>
          </header>
        </Slide>
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
  themes: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired,
  addNote: PropTypes.func.isRequired,
  updateNote: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired,
  notes: PropTypes.array
};

export default withStyles(styles)(Notes);
