import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Note from './Note';

const styles = () => ({
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
});

class Notes extends React.PureComponent {
  render() {
    const { classes, notes, updateNote } = this.props;

    return notes ? (
      notes.map((note, id) => (
        <Note key={id} note={note} updateNote={updateNote} />
      ))
    ) : (
      <CircularProgress className={classes.progress} />
    );
  }
}

Notes.propTypes = {
  classes: PropTypes.object.isRequired,
  updateNote: PropTypes.func.isRequired,
  notes: PropTypes.array
};

export default withStyles(styles)(Notes);
