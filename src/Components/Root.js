import React from 'react';
import moment from 'moment';
import SunCalc from 'suncalc';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Snackbar from '@material-ui/core/Snackbar';
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

  componentDidMount = () =>
    navigator.geolocation &&
    navigator.geolocation.getCurrentPosition(this.setTheme);

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

  updateNote = note => console.log('Update Note:', note);

  render() {
    const { classes } = this.props;
    const { snackMessage, notes } = this.state;

    return (
      <div className={classes.root}>
        <Notes notes={notes} updateNote={this.updateNote} />
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
