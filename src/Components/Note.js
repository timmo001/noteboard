import React from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import DoneIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import clone from './Common/clone';

const styles = () => ({
  noteContainer: {
    width: '100%',
    paddingTop: '100%' /* 1:1 Aspect Ratio */,
    position: 'relative' /* If you want text inside of it */
  },
  note: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  controls: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    right: -48
  }
});

class Note extends React.PureComponent {
  state = { dragging: false, controls: false, editable: false };
  timeout;

  handleDrag = () => {
    clearTimeout(this.timeout);
    this.setState({ dragging: true, controls: false });
  };

  handleStop = (_e, data) => {
    this.setState({ dragging: false });
    let { note } = this.props;
    note.x = data.x;
    note.y = data.y;
    this.props.updateNote(note);
  };

  toggleEditable = () =>
    this.setState({
      editable: !this.state.editable,
      editableNote: this.props.note
    });

  showControls = () => {
    if (!this.state.dragging && !this.state.controlsEntered)
      this.setState({ controls: true });
  };

  hideControls = () => this.setState({ controls: false });

  timeoutControls = () => {
    clearTimeout(this.timeout);
    if (!this.state.dragging && !this.state.controlsEntered) {
      this.showControls();
      this.timeout = setTimeout(() => this.hideControls(), 1200);
    }
  };

  handleEnterControls = () => {
    clearTimeout(this.timeout);
    this.setState({ controlsEntered: true });
    this.showControls();
  };

  handleExitControls = () => {
    this.setState({ controlsEntered: false });
    this.timeoutControls();
  };

  noteChange = (path, value) => {
    let note = clone(this.state.editableNote);
    const lastItem = path.pop();
    let secondLastItem = path.reduce((o, k) => (o[k] = o[k] || {}), note);
    console.log('lastItem:', lastItem);
    console.log('secondLastItem:', secondLastItem);
    secondLastItem[lastItem] = value;
    this.setState({ editableNote: note });
    this.props.updateNote(note);
  };

  textChange = event => this.noteChange(['text'], event.target.value);

  render() {
    const { classes, note } = this.props;
    const { dragging, controls, editable, editableNote } = this.state;

    return (
      <Draggable
        defaultPosition={{ x: note.x, y: note.y }}
        disabled={editable}
        onDrag={this.handleDrag}
        onStop={this.handleStop}>
        <div
          style={{
            width: note.size || 180
          }}>
          <div
            className={classes.noteContainer}
            onMouseMove={this.timeoutControls}>
            <Card
              className={classes.note}
              elevation={dragging ? 3 : 1}
              style={{
                background: note.background || '#FFFF88'
              }}>
              <CardContent>
                {editable ? (
                  <InputBase
                    className={classes.textField}
                    multiline
                    value={editableNote.text}
                    onChange={this.textChange}
                    style={{
                      color: note.color || '#000000',
                      fontSize: `${note.size / 10}em` || '12em'
                    }}
                  />
                ) : (
                  <Typography
                    component="span"
                    variant="body1"
                    style={{
                      color: note.color || '#000000',
                      fontSize: `${note.size / 10}em` || '12em'
                    }}>
                    {note.text}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>
          <Grow in={controls}>
            <div
              className={classes.controls}
              onMouseEnter={this.handleEnterControls}
              onMouseLeave={this.handleExitControls}>
              <IconButton aria-label="Delete" className={classes.margin}>
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="Edit"
                className={classes.margin}
                onClick={this.toggleEditable}>
                {editable ? (
                  <DoneIcon fontSize="small" />
                ) : (
                  <EditIcon fontSize="small" />
                )}
              </IconButton>
            </div>
          </Grow>
        </div>
      </Draggable>
    );
  }
}

Note.propTypes = {
  classes: PropTypes.object.isRequired,
  note: PropTypes.object.isRequired,
  updateNote: PropTypes.func.isRequired
};

export default withStyles(styles)(Note);
