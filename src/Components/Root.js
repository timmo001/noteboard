import React from 'react';
import moment from 'moment';
import SunCalc from 'suncalc';
import PropTypes from 'prop-types';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';
import auth from '@feathersjs/authentication-client';
import withStyles from '@material-ui/core/styles/withStyles';
import Snackbar from '@material-ui/core/Snackbar';
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
    if (!data)
      app.passport.getJWT().then(accessToken => {
        accessToken &&
          this.authenticate({
            strategy: 'jwt',
            accessToken
          });
      });
    else this.authenticate(data);
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
        this.setState({ loginError: e.message }, () =>
          setTimeout(
            () => this.setState({ loggedIn: false, loginError: undefined }),
            10000
          )
        );
      });

  getNotes = async () => {
    const notes = [];
    const getter = await app.service('notes').find();
    getter.data.forEach(note => {
      notes.push(note);
    });
    process.env.NODE_ENV === 'development' && console.log('Notes:', notes);
    this.setState({ notes });
  };

  updateNote = note => console.log('Update Note:', note);

  render() {
    const { classes } = this.props;
    const { snackMessage, loggedIn, loginError, notes } = this.state;

    return (
      <div className={classes.root}>
        {loggedIn ? (
          <Notes notes={notes} updateNote={this.updateNote} />
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
