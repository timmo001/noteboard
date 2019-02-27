import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Note from "./Note";

const styles = () => ({
  progress: {
    position: "absolute",
    top: "50%",
    left: "50%"
  }
});

class Notes extends React.PureComponent {
  render() {
    const { classes, notes, updateNote } = this.props;

    return (
      <Grid container>
        {notes ? (
          notes.map((note, id) => (
            <Note key={id} note={note} updateNote={updateNote} />
          ))
        ) : (
          <CircularProgress className={classes.progress} />
        )}
      </Grid>
    );
  }
}

Notes.propTypes = {
  classes: PropTypes.object.isRequired,
  notes: PropTypes.array.isRequired,
  updateNote: PropTypes.func.isRequired
};

export default withStyles(styles)(Notes);
