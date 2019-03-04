import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Draggable from 'react-draggable';

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
  }
});

class Note extends React.PureComponent {
  state = { dragging: false };

  handleDrag = () => this.setState({ dragging: true });

  handleStop = (_e, data) => {
    this.setState({ dragging: false });
    let { note } = this.props;
    note.x = data.x;
    note.y = data.y;
    this.props.updateNote(note);
  };

  render() {
    const { classes, note } = this.props;
    const { dragging } = this.state;

    return (
      <Draggable
        defaultPosition={{ x: note.x, y: note.y }}
        onDrag={this.handleDrag}
        onStop={this.handleStop}>
        <div
          style={{
            width: note.size || 180
          }}>
          <div className={classes.noteContainer}>
            <Card
              className={classes.note}
              elevation={dragging ? 3 : 1}
              style={{
                background: note.background || '#FFFF88'
              }}>
              <CardContent>
                <Typography
                  component="span"
                  variant="body1"
                  style={{
                    color: note.text.color || '#000000',
                    fontSize: `${note.text.size / 10}em` || '12em'
                  }}>
                  {note.text}
                </Typography>
              </CardContent>
            </Card>
          </div>
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
