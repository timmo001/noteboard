import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Rnd } from 'react-rnd';
import { SketchPicker } from 'react-color';
import markdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import ReactHtmlParser from 'react-html-parser';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import DoneIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import PaletteIcon from '@material-ui/icons/Palette';
import PhotoSizeSelectSmallIcon from '@material-ui/icons/PhotoSizeSelectSmall';
import FormatSizeIcon from '@material-ui/icons/FormatSize';
import DeleteIcon from '@material-ui/icons/Delete';
import clone from './Common/clone';
import PushPin from '../resources/pushpin.svg';
import ConfirmDialog from './Common/ConfirmDialog';

const styles = theme => ({
  noteRoot: {
    height: '100%',
    width: '100%'
  },
  card: {
    background: 'var(--background)',
    padding: 12
  },
  sticky: {
    '&:before': {
      position: 'absolute',
      content: '""',
      width: '100%',
      height: 24,
      top: 0,
      left: 0,
      padding: 12,
      transform: 'translateX(-2px) rotate(-0.8deg) skew(-0.8deg, -0.4deg)',
      background: 'var(--background)'
    },
    boxShadow: 'none',
    borderRadius: 1,
    transform: 'translateX(2px) rotate(-0.8deg) skew(0.8deg, 0.4deg)',
    // eslint-disable-next-line no-dupe-keys
    boxShadow:
      '0px 6px 6px -2px rgba(0,0,0,0.2), 0px 2px 10px 2px rgba(0,0,0,0.12)',
    background: 'var(--background)'
  },
  pin: {
    overflow: 'visible',
    borderRadius: 1,
    padding: 12,
    transform: 'rotate(-1.4deg)',
    background: 'var(--background)'
  },
  pinImage: {
    position: 'absolute',
    top: -8,
    left: -8,
    height: 38,
    width: 38
  },
  note: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  noteContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    paddingTop: 28,
    paddingLeft: 18,
    paddingRight: 18,
    paddingBottom: '16px !important'
  },
  noteTextInput: {
    height: '100%',
    width: '100%',
    padding: 0,
    resize: 'none',
    background: 'none',
    border: 'none',
    overflow: 'auto',
    outline: 'none',
    boxShadow: 'none',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: '1rem',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0.00938em'
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
    background: 'none !important',
    boxShadow: 'none !important'
  },
  popoverContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing.unit,
    zIndex: 10000,
    background: theme.palette.main
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
    anchorEl: null,
    dragging: false,
    controls: false,
    editable: false,
    showNoteSize: false,
    showStyle: false,
    showText: false,
    confirmDelete: false
  };
  controlsTimeout;
  editableTimeout;

  componentWillUnmount = () => {
    clearTimeout(this.controlsTimeout);
    clearTimeout(this.editableTimeout);
  };

  handleDrag = () => {
    clearTimeout(this.controlsTimeout);
    this.setState({ dragging: true, controls: false });
  };

  handleDragStop = (_e, data) => {
    this.setState({ dragging: false });
    let { note } = this.props;
    note.x = data.x;
    note.y = data.y;
    this.props.updateNote(note, true);
  };

  editableOff = () =>
    this.setState({ editable: false, editableNote: undefined });

  editableOn = () =>
    this.setState({ editable: true, editableNote: this.props.note });

  timeoutEditable = () => {
    clearTimeout(this.editableTimeout);
    this.editableOn();
    this.editableTimeout = setTimeout(
      () => !this.state.anchorEl && this.editableOff(),
      8000
    );
  };

  toggleEditable = () => {
    if (this.state.editable) {
      clearTimeout(this.editableTimeout);
      this.editableOff();
    } else this.timeoutEditable();
  };

  showControls = () => {
    if (!this.state.dragging && !this.state.controlsEntered)
      this.setState({ controls: true });
  };

  hideControls = () => this.setState({ controls: false });

  timeoutControls = () => {
    clearTimeout(this.controlsTimeout);
    if (!this.state.dragging && !this.state.controlsEntered) {
      this.showControls();
      this.controlsTimeout = setTimeout(() => this.hideControls(), 1200);
    }
  };

  handleEnterControls = () => {
    clearTimeout(this.controlsTimeout);
    clearTimeout(this.editableTimeout);
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
    secondLastItem[lastItem] = value;
    this.setState({ editableNote: note });
    this.props.updateNote(note, true);
  };

  changeNoteText = event => {
    this.noteChange(['text'], event.target.value);
    clearTimeout(this.editableTimeout);
    this.editableTimeout = setTimeout(() => this.editableOff(), 8000);
  };

  handleNumberChange = name => event =>
    this.noteChange([name], Number(event.target.value));

  closePopover = () =>
    this.setState(
      {
        anchorEl: null,
        showNoteSize: false,
        showStyle: false,
        showText: false
      },
      () => {
        this.timeoutControls();
        this.timeoutEditable();
      }
    );

  changeNoteSize = event =>
    this.setState({
      anchorEl: event.currentTarget,
      showNoteSize: !this.state.showNoteSize
    });

  changeStyle = event =>
    this.setState({
      anchorEl: event.currentTarget,
      showStyle: !this.state.showStyle
    });

  changeText = event =>
    this.setState({
      anchorEl: event.currentTarget,
      showText: !this.state.showText
    });

  colorChanged = color =>
    this.noteChange(
      ['background'],
      `rgba(${Object.values(color.rgb).join(',')})`
    );

  changeTextColor = event =>
    this.setState({
      anchorEl: event.currentTarget,
      showText: !this.state.showText
    });

  colorTextChanged = color =>
    this.noteChange(['color'], `rgba(${Object.values(color.rgb).join(',')})`);

  styleChanged = event => this.noteChange(['style'], event.target.value);

  deleteNoteConfirm = () => this.setState({ confirmDelete: true });

  confirmClose = () => this.setState({ confirmDelete: false });

  confirmDelete = () => {
    this.confirmClose();
    this.hideControls();
    this.props.deleteNote(this.props.note, true);
  };

  render() {
    const { classes, note } = this.props;
    const {
      anchorEl,
      dragging,
      controls,
      editable,
      editableNote,
      showNoteSize,
      showStyle,
      showText,
      confirmDelete
    } = this.state;

    const text = new markdownIt({
      html: true,
      xhtmlOut: true,
      breaks: false,
      langPrefix: 'language-',
      linkify: true,
      typographer: true
    })
      .use(emoji)
      .render(note.text);

    return (
      <div>
        <Rnd
          position={note.x && note.y && { x: note.x, y: note.y }}
          size={{
            height: editable ? editableNote.height || 180 : note.height || 180,
            width: editable ? editableNote.width || 180 : note.width || 180
          }}
          style={{ cursor: 'auto' }}
          disableDragging={editable}
          enableResizing={false}
          onDrag={this.handleDrag}
          onDragStop={this.handleDragStop}>
          <div className={classes.noteRoot}>
            <div
              className={classes.noteContainer}
              onMouseMove={this.timeoutControls}>
              <Card
                className={classnames(
                  classes.note,
                  classes[editable ? editableNote.style : note.style]
                )}
                elevation={dragging ? 3 : 1}
                style={{
                  '--background': editable
                    ? editableNote.background || 'rgba(248, 231, 28, 1)'
                    : note.background || 'rgba(248, 231, 28, 1)'
                }}>
                {note.style === 'pin' && (
                  <CardMedia
                    className={classes.pinImage}
                    image={PushPin}
                    title="Pin"
                  />
                )}
                <CardContent className={classes.noteContent}>
                  {editable ? (
                    <textarea
                      className={classes.noteTextInput}
                      value={editableNote.text}
                      onChange={this.changeNoteText}
                      style={{
                        color: editableNote.color || 'rgba(0, 0, 0, 1)',
                        fontSize: `${editableNote.font_size / 10}em` || '12em'
                      }}
                    />
                  ) : (
                    <Typography
                      className={classes.noteTextInput}
                      style={{
                        color: note.color || 'rgba(0, 0, 0, 1)',
                        fontSize: `${note.font_size / 10}em` || '12em'
                      }}
                      component="span">
                      {ReactHtmlParser(text)}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </div>
            <Grow in={editable || controls}>
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
                          aria-owns={anchorEl ? 'menu' : undefined}
                          aria-haspopup="true"
                          onClick={this.changeNoteSize}>
                          <PhotoSizeSelectSmallIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          className={classes.icon}
                          aria-label="Note Color"
                          aria-owns={anchorEl ? 'menu' : undefined}
                          aria-haspopup="true"
                          onClick={this.changeStyle}>
                          <PaletteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          className={classes.icon}
                          aria-label="Text"
                          aria-owns={anchorEl ? 'menu' : undefined}
                          aria-haspopup="true"
                          onClick={this.changeText}>
                          <FormatSizeIcon fontSize="small" />
                        </IconButton>
                      </div>
                      <div
                        className={classes.editControls}
                        style={{ position: 'absolute', top: -42, right: -42 }}>
                        <IconButton
                          className={classes.icon}
                          aria-label="Delete"
                          onClick={this.deleteNoteConfirm}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                      <Popover
                        className={classes.popover}
                        open={anchorEl ? true : false}
                        anchorEl={anchorEl}
                        onClose={this.closePopover}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                        transformOrigin={{
                          vertical: 52,
                          horizontal: 'left'
                        }}>
                        {showNoteSize && (
                          <div className={classes.popoverContent}>
                            <TextField
                              margin="normal"
                              InputLabelProps={{ shrink: true }}
                              label="Note Height"
                              type="number"
                              value={editableNote.height}
                              onChange={this.handleNumberChange('height')}
                            />
                            <TextField
                              margin="normal"
                              InputLabelProps={{ shrink: true }}
                              label="Note Width"
                              type="number"
                              value={editableNote.width}
                              onChange={this.handleNumberChange('width')}
                            />
                          </div>
                        )}
                        {showStyle && (
                          <div className={classes.popoverContent}>
                            <FormControl
                              component="fieldset"
                              className={classes.formControl}>
                              <FormLabel component="legend">Style</FormLabel>
                              <RadioGroup
                                row
                                aria-label="Style"
                                name="style"
                                className={classes.radioGroup}
                                value={editableNote.style}
                                onChange={this.styleChanged}>
                                <FormControlLabel
                                  value="card"
                                  control={<Radio />}
                                  label="Card"
                                />
                                <FormControlLabel
                                  value="sticky"
                                  control={<Radio />}
                                  label="Sticky"
                                />
                                <FormControlLabel
                                  value="pin"
                                  control={<Radio />}
                                  label="Pin"
                                />
                              </RadioGroup>
                            </FormControl>
                            <SketchPicker
                              className={classes.colorPicker}
                              color={editableNote.background}
                              colors={pickerColors}
                              onChangeComplete={this.colorChanged}
                            />
                          </div>
                        )}
                        {showText && (
                          <div className={classes.popoverContent}>
                            <TextField
                              margin="normal"
                              InputLabelProps={{
                                shrink: true
                              }}
                              label="Font Size"
                              type="number"
                              value={editableNote.font_size}
                              onChange={this.handleNumberChange('font_size')}
                            />
                            <SketchPicker
                              className={classes.colorPicker}
                              color={editableNote.color}
                              colors={pickerColors}
                              onChangeComplete={this.colorTextChanged}
                            />
                          </div>
                        )}
                      </Popover>
                    </div>
                  </Grow>
                )}
              </div>
            </Grow>
          </div>
        </Rnd>
        {confirmDelete && (
          <ConfirmDialog
            text="Delete this note?"
            handleClose={this.confirmClose}
            handleConfirm={this.confirmDelete}
          />
        )}
      </div>
    );
  }
}

Note.propTypes = {
  classes: PropTypes.object.isRequired,
  note: PropTypes.object.isRequired,
  updateNote: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired
};

export default withStyles(styles)(Note);
