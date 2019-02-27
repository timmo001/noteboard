import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Snackbar from "@material-ui/core/Snackbar";
import Notes from "./Notes";

const styles = theme => ({
  root: {
    position: "absolute",
    height: "100%",
    width: "100%",
    maxHeight: "100%",
    maxWidth: "100%",
    background: theme.palette.backgrounds.main
  }
});

class Root extends React.PureComponent {
  state = {
    snackMessage: { open: false, text: "" },
    connected: false,
    notes: [
      {
        note: "Hello World!",
        x: 100,
        y: 200
      },
      {
        note: "Hello!",
        x: 300,
        y: 140
      }
    ]
  };

  updateNote = note => console.log("Update Note:", note);

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
            vertical: "bottom",
            horizontal: "right"
          }}
          ContentProps={{
            "aria-describedby": "message-id"
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
  theme: PropTypes.object.isRequired
};

export default withStyles(styles)(Root);
