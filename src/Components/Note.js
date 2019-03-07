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
import { SketchPicker } from 'react-color';
import DoneIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import PaletteIcon from '@material-ui/icons/Palette';
import PhotoSizeSelectSmallIcon from '@material-ui/icons/PhotoSizeSelectSmall';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
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
  textField: {
    padding: 0
  },
  controls: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    right: -48
  },
  editControlsContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  editControls: {
    display: 'flex',
    flexDirection: 'column'
  },
  icon: {
    height: 42,
    width: 42
  },
  colorPicker: {
    position: 'fixed',
    top: 42,
    left: 42,
    zIndex: 1000
  }
});

const pickerColors = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b'
];

class Note extends React.PureComponent {
  state = {
    dragging: false,
    controls: false,
    editable: false,
    showColorPicker: false
  };
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
    this.props.updateNote(note, true);
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
    this.props.updateNote(note, true);
  };

  changeText = event => this.noteChange(['text'], event.target.value);

  changeColor = () =>
    this.setState({ showColorPicker: !this.state.showColorPicker });

  colorChanged = color => this.noteChange(['background'], color.hex);

  changeTextColor = () =>
    this.setState({ showTextColorPicker: !this.state.showTextColorPicker });

  colorTextChanged = color => this.noteChange(['color'], color.hex);

  render() {
    const { classes, note } = this.props;
    const {
      dragging,
      controls,
      editable,
      editableNote,
      showColorPicker,
      showTextColorPicker
    } = this.state;

    return (
      <Draggable
        position={{ x: note.x, y: note.y }}
        disabled={editable}
        onDrag={this.handleDrag}
        onStop={this.handleStop}>
        <div
          style={{
            width: editable ? editableNote.size || 180 : note.size || 180
          }}>
          <div
            className={classes.noteContainer}
            onMouseMove={this.timeoutControls}>
            <Card
              className={classes.note}
              elevation={dragging ? 3 : 1}
              style={{
                background: editable
                  ? editableNote.background || '#FFFF88'
                  : note.background || '#FFFF88'
              }}>
              <CardContent>
                {editable ? (
                  <InputBase
                    className={classes.textField}
                    multiline
                    value={editableNote.text}
                    onChange={this.changeText}
                    style={{
                      color: editableNote.color || '#000000',
                      fontSize: `${editableNote.size / 10}em` || '12em'
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
              <IconButton
                className={classes.icon}
                aria-label="Edit"
                onClick={this.toggleEditable}>
                {editable ? (
                  <DoneIcon fontSize="small" />
                ) : (
                  <EditIcon fontSize="small" />
                )}
              </IconButton>
              {editable && (
                <Grow in>
                  <div className={classes.editControlsContainer}>
                    <div className={classes.editControls}>
                      <IconButton
                        className={classes.icon}
                        aria-label="Note Size"
                        onClick={this.changeNoteSize}>
                        <PhotoSizeSelectSmallIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        className={classes.icon}
                        aria-label="Color"
                        onClick={this.changeColor}>
                        <PaletteIcon fontSize="small" />
                      </IconButton>
                      {showColorPicker && (
                        <SketchPicker
                          className={classes.colorPicker}
                          color={editableNote.background}
                          colors={pickerColors}
                          onChangeComplete={this.colorChanged}
                        />
                      )}
                      <IconButton
                        className={classes.icon}
                        aria-label="Text Size"
                        onClick={this.changeTextSize}>
                        <FormatSizeIcon fontSize="small" />
                      </IconButton>
                      {showTextColorPicker && (
                        <SketchPicker
                          className={classes.colorPicker}
                          color={editableNote.color}
                          colors={pickerColors}
                          onChangeComplete={this.colorTextChanged}
                        />
                      )}
                    </div>
                    <div
                      className={classes.editControls}
                      style={{ position: 'absolute', top: -42, right: -42 }}>
                      <IconButton
                        className={classes.icon}
                        aria-label="Delete"
                        onClick={this.deleteNote}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                </Grow>
              )}
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
