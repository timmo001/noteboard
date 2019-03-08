import React from 'react';
import moment from 'moment';
import SunCalc from 'suncalc';
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
  `${window.location.protocol}//${window.location.hostname}:${process.env
    .REACT_APP_API_PORT || 3030}`
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
    navigator.geolocation &&
      navigator.geolocation.getCurrentPosition(this.setTheme);
    this.login();
  };

  setTheme = position =>
    moment(
      SunCalc.getTimes(
        new Date(),
        position.coords.latitude,
        position.coords.longitude
      ).sunset
    ).isBefore(moment())
      ? this.props.setTheme(1)
      : this.props.setTheme(0);

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
        this.setState({ loggedIn: true });
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
  };

  addToNotes = note => {
    const notes = clone(this.state.notes);
    notes.push(note);
    this.setState({ notes });
  };

  updateNote = (noteIn, updateServer) => {
    const notes = clone(this.state.notes);
    const note = clone(noteIn);
    const id = clone(note._id);
    notes[notes.findIndex(n => n._id === id)] = noteIn;
    this.setState({ notes });
    delete note._id;
    delete note.user;
    delete note.userId;
    process.env.NODE_ENV === 'development' &&
      console.log('Update Note:', updateServer, id, note);
    if (updateServer)
      socket.emit('patch', 'notes', id, note, (error, note) => {
        if (error) {
          process.env.NODE_ENV === 'development' &&
            console.error('Error updating', id, ':', error);
          // this.setState({
          //   snackMessage: {
          //     open: true,
          //     error: true,
          //     persistent: false,
          //     text: `Error updating: ${error}`
          //   }
          // });
        } else {
          process.env.NODE_ENV === 'development' &&
            console.log('Updated Note:', id, note);
          // this.setState({
          //   snackMessage: {
          //     open: true,
          //     persistent: false,
          //     text: 'Updated Note'
          //   }
          // });
        }
      });
  };

  render() {
    const { classes } = this.props;
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
            notes={notes}
            logout={this.logout}
            updateNote={this.updateNote}
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
