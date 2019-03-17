import React from 'react';
import PropTypes from 'prop-types';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';
import auth from '@feathersjs/authentication-client';
import red from '@material-ui/core/colors/red';
import withStyles from '@material-ui/core/styles/withStyles';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import clone from './Common/clone';
import Login from './Login';
import Notes from './Notes';

const styles = theme => ({
  root: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    maxHeight: '100%',
    maxWidth: '100%',
    background: theme.palette.background
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
});

const app = feathers();
const socket = io(
  `${process.env.REACT_APP_API_PROTOCOL || window.location.protocol}//${process
    .env.REACT_APP_API_HOSTNAME || window.location.hostname}:${process.env
    .REACT_APP_API_PORT || 3345}`
);

// Setup the transport (Rest, Socket, etc.) here
app.configure(socketio(socket));

// Available options are listed in the "Options" section
app.configure(auth({ storage: localStorage }));

class Root extends React.PureComponent {
  state = {
    snackMessage: { open: false, text: '' },
    connected: false,
    loginAttempted: false,
    loggedIn: false
  };

  componentDidMount = () => {
    let id = localStorage.getItem('theme');
    if (!id) id = 10;
    this.props.setTheme(id);
    this.login();
  };

  login = (data = undefined) => {
    process.env.NODE_ENV === 'development' && console.log('login:', data);
    if (!data)
      app.passport.getJWT().then(accessToken => {
        accessToken &&
          this.authenticate({
            strategy: 'jwt',
            accessToken
          });
      });
    else this.authenticate(data);
    setTimeout(() => this.setState({ loginAttempted: true }), 500);
  };

  authenticate = data =>
    app
      .authenticate(data)
      .then(response => {
        process.env.NODE_ENV === 'development' &&
          console.log('Authenticated:', response);
        return app.passport.verifyJWT(response.accessToken);
      })
      .then(payload => {
        process.env.NODE_ENV === 'development' &&
          console.log('JWT Payload:', payload);
        return app.service('users').get(payload.userId);
      })
      .then(user => {
        app.set('user', user);
        process.env.NODE_ENV === 'development' &&
          console.log('User:', app.get('user'));
        this.setState({ loggedIn: true, userId: app.get('user')._id });
        this.getNotes();
      })
      .catch(e => {
        console.error('Authentication error:', e);
        this.setState({ loggedIn: false, loginError: e.message }, () =>
          setTimeout(() => this.setState({ loginError: undefined }), 10000)
        );
      });

  logout = () =>
    app
      .logout()
      .then(() => this.setState({ loggedIn: false, loginError: undefined }));

  getNotes = async () => {
    const notes = [];
    const notesService = await app.service('notes');
    const getter = await notesService.find();
    getter.data.forEach(note => {
      notes.push(note);
    });
    process.env.NODE_ENV === 'development' && console.log('Notes:', notes);
    this.setState({ notes });
    notesService.on('created', note => this.addToNotes(note));
    notesService.on('updated', note => this.updateNote(note, false));
    notesService.on('patched', note => this.updateNote(note, false));
    notesService.on('removed', note => this.deleteNote(note, false));
  };

  addToNotes = note => {
    if (note.userId !== this.state.userId) {
      const notes = clone(this.state.notes);
      notes.push(note);
      this.setState({ notes });
    }
  };

  addNote = () => {
    process.env.NODE_ENV === 'development' && console.log('Add Note');
    socket.emit(
      'create',
      'notes',
      {
        x: 20,
        y: 20,
        background: 'rgba(248, 231, 28, 1)',
        height: 180,
        width: 180,
        font_size: 12,
        color: 'rgba(0, 0, 0, 1)',
        text: 'New Note',
        style: 'card'
      },
      (error, note) => {
        if (error)
          process.env.NODE_ENV === 'development' &&
            console.error('Error creating new note:', error);
        else
          process.env.NODE_ENV === 'development' &&
            console.log('Created new note:', note);
      }
    );
  };

  updateNote = (noteIn, updateServer) => {
    const notes = clone(this.state.notes);
    const note = clone(noteIn);
    const id = clone(note._id);
    notes[notes.findIndex(n => n._id === id)] = noteIn;
    this.setState({ notes });
    process.env.NODE_ENV === 'development' &&
      console.log('Update Note:', updateServer, id, note);
    if (updateServer)
      socket.emit('patch', 'notes', id, note, (error, note) => {
        if (error)
          process.env.NODE_ENV === 'development' &&
            console.error('Error updating', id, ':', error);
        else
          process.env.NODE_ENV === 'development' &&
            console.log('Updated Note:', id, note);
      });
  };

  deleteNote = (note, updateServer) => {
    process.env.NODE_ENV === 'development' && console.log('Delete Note:', note);
    if (updateServer)
      socket.emit('remove', 'notes', note._id, (error, note) => {
        if (error)
          process.env.NODE_ENV === 'development' &&
            console.error('Error removing', note._id, ':', error);
        else
          process.env.NODE_ENV === 'development' &&
            console.log('Removed Note:', note._id, note);
      });
    else {
      const notes = clone(this.state.notes);
      const id = notes.findIndex(n => n._id === note._id);
      notes.splice(id, 1);
      this.setState({ notes });
    }
  };

  render() {
    const { classes, theme, themes, setTheme } = this.props;
    const {
      snackMessage,
      loginAttempted,
      loggedIn,
      loginError,
      notes
    } = this.state;

    return (
      <div className={classes.root}>
        {!loginAttempted ? (
          <CircularProgress className={classes.progress} />
        ) : loggedIn ? (
          <Notes
            theme={theme}
            themes={themes}
            notes={notes}
            logout={this.logout}
            addNote={this.addNote}
            updateNote={this.updateNote}
            deleteNote={this.deleteNote}
            setTheme={setTheme}
          />
        ) : (
          <Login login={this.login} loginError={loginError} />
        )}
        <Snackbar
          open={snackMessage.open}
          autoHideDuration={!snackMessage.persistent ? 4000 : null}
          onClose={!snackMessage.persistent ? this.handleSnackbarClose : null}
          onExited={this.handleExited}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          ContentProps={{
            'aria-describedby': 'message-id'
          }}
          style={{ backgroundColor: snackMessage.error && red[500] }}
          message={<span id="message-id">{snackMessage.text}</span>}
          action={snackMessage.actions}
        />
      </div>
    );
  }
}

Root.propTypes = {
  classes: PropTypes.object.isRequired,
  themes: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  addTheme: PropTypes.func.isRequired,
  setTheme: PropTypes.func.isRequired
};

export default withStyles(styles)(Root);
