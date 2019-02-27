import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Draggable from "react-draggable";

const styles = () => ({});

class Note extends React.PureComponent {
  state = {};

  handleStop = (_e, data) => {
    let { note } = this.props;
    note.x = data.x;
    note.y = data.y;
    this.props.updateNote(note);
  };
  render() {
    const { classes, note } = this.props;

    return (
      <Grid item xs={4} md={3} lg={2} xl={2}>
        <Draggable
          defaultPosition={{ x: note.x, y: note.y }}
          onDrag={this.handleDrag}
          onStop={this.handleStop}
        >
          <Card className={classes.note}>
            <CardContent>
              <Typography component="span" variant="body1">
                {note.note}
              </Typography>
            </CardContent>
          </Card>
        </Draggable>
      </Grid>
    );
  }
}

Note.propTypes = {
  classes: PropTypes.object.isRequired,
  note: PropTypes.object.isRequired,
  updateNote: PropTypes.func.isRequired
};

export default withStyles(styles)(Note);
