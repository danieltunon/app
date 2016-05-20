import React from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import moment from 'moment';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Schedule from 'material-ui/svg-icons/action/schedule';

const style = {
  h3: {
    marginTop: 20,
    fontWeight: 400,
  },
  block: {
    display: 'flex',
  },
  block2: {
    margin: 10,
  },
  button: {
    boxShadow: '0px',
    border: '0px',
    backgroundColor: '',
  },
};

function setTime(time) {
  var times = {
    '1 hour': new moment().add(2, 'minutes').format('X'),
    '3 hours': new moment().add(3, 'hour').format('X'),
    '6 hours': new moment().add(6, 'hour').format('X'),
    '12 hours': new moment().add(12, 'hour').format('X'),
  };
  console.log(times[time]);
  console.log(typeof times[time]);
  // formats: Tue May 17 2016 17:33:26 GMT-0700 (PDT)
  //formats UNIX timestamp: '1463763702'
  return times[time];
};

export default class SchedulePopOver extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      label: 'Schedule for Later',
      time: '',
      schedule: false,
    };
  }

  handleTouchTap(event) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleClickTime(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('EVENT CLICK TARGET ', event.target);
    this.setState({
      time: event.target.innerText,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }
  handleCancel() {
    this.setState({
      time: '',
      open: false,
    });
  }

  handleConfirm(event) {
    const { onSchedule, tweet } = this.props;
    event.preventDefault();
    tweet.schedule = setTime(this.state.time);

    this.setState({
      label: 'Scheduled for ' + this.state.time,
      open: false,
      scheduled: true,
    })
    onSchedule();
  }
  render() {
    return (
      <div>
        <FloatingActionButton
          onTouchTap={this.handleTouchTap.bind(this)}
          label={this.state.label}
          mini={true}
          backgroundColor="#89bdd3"
          style={style.button}
        >
        <Schedule/>
        </FloatingActionButton>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal:'right',vertical:'top'}}
          targetOrigin={{horizontal:'left',vertical:'top'}}

          onRequestClose={this.handleRequestClose.bind(this)}
        >
          {this.state.time ?
            <Menu
            onBlur={this.handleCancel.bind(this)}
            >
              <MenuItem key={1} primaryText="Schedule" onTouchTap={this.handleConfirm.bind(this)}/>
              <MenuItem key={2} primaryText="Cancel" onTouchTap={this.handleCancel.bind(this)}/>
            </Menu>
          : <Menu>
              <MenuItem key={3} primaryText="1 hour" onTouchTap={this.handleClickTime.bind(this)}/>
              <MenuItem key={4} primaryText="3 hours" onTouchTap={this.handleClickTime.bind(this)}/>
              <MenuItem key={5} primaryText="6 hours" onTouchTap={this.handleClickTime.bind(this)}/>
              <MenuItem key={6} primaryText="12 hours" onTouchTap={this.handleClickTime.bind(this)}/>
          </Menu> }
        </Popover>
      </div>
    );
  }
}
