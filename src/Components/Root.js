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

class Root extends React.PureComponent {
  state = {
    snackMessage: { open: false, text: '' },
    connected: false,
    loggedIn: false,
    notes: [
      {
        note: 'Hello World!',
        x: 100,
        y: 200,
        background: '#FFFF88',
        size: 180,
        text: {
          color: '#000000',
          size: '15'
        }
      },
      {
        note: 'Hello!',
        x: 300,
        y: 140,
        background: '#FF6D00',
        size: 200,
        text: {
          color: '#000000',
          size: '12'
        }
      }
    ]
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
    const socket = io(
      `${window.location.protocol}//${window.location.hostname}:${process.env
        .REACT_APP_API_PORT || 3030}`
    );
    const app = feathers();

    // Setup the transport (Rest, Socket, etc.) here
    app.configure(socketio(socket));

    // Available options are listed in the "Options" section
    app.configure(auth({ storage: localStorage }));

    if (!data)
      app.passport.getJWT().then(accessToken => {
        accessToken &&
          this.authenticate(app, {
            strategy: 'jwt',
            accessToken
          });
      });
    else this.authenticate(app, data);
  };

  authenticate = (app, data) => {
    console.log(data);
    app
      .authenticate(data)
      .then(response => {
        console.log('Authenticated!', response);
        app.passport.verifyJWT(response.accessToken);
        this.setState({ loggedIn: true });
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
