import React, { Component } from 'react';
import "./i.css"
import { connect } from 'react-redux';
import { firebaseDb } from "../../../firebase"
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import AlarmAddIcon from '@material-ui/icons/AlarmAdd';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PhoneInTalkIcon from '@material-ui/icons/PhoneInTalk';

const chips = ["11:00 - 11:15 AM", "11:16 - 11:20 AM", "11:21 - 11:25 AM", "11:26 - 11:30 AM"];
const todaysDdate = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + '-' + mm + '-' + yyyy;
  return today
}


export class Doctor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      selectedSlots: [],
      previousSlots: [],
      dialogOpen: false,
      today: todaysDdate(),
      name: null,
      appointments: null,
      loading: true,
      noChangeAllowed: false,
      showSnack: false,
      message: '',
      severity: ''
    }
  }

  componentWillMount() {
    firebaseDb.ref(`appointments/`+this.state.today).once('value').then(snapshot => {
      const appointments = snapshot.val() || null;
      firebaseDb.ref(`timeSlots/`).once('value').then(snapshot => {
        const selectedSlots = snapshot.val() || [];
        this.setState({
          selectedSlots,
          previousSlots: [...selectedSlots],
          appointments,
          loading: false
        })
    }).catch(()=>this.error());
    
    }).catch(()=>this.error());
    
  }

  error = () =>{
    this.setState(
    { 
      message :"Something Went Wrong",
      severity: 'error',
      showSnack : true, 
      loading: false,
    })
  }

  renderappointments = (app) =>{
    var obj = {};
    Object.keys(app).forEach(a=>{
      if(obj[app[a].timeSlot]) 
        obj[app[a].timeSlot].push(app[a])
      else obj[app[a].timeSlot]= [app[a]]
    })
    return obj
  }
  handleClose = () => this.setState({  dialogOpen: false, loading: false })

  handleSelect = (id) => {
    let { selectedSlots } = this.state 
    const index = selectedSlots.indexOf(id);
    if(index === -1) {
      selectedSlots.push(id)
      this.setState({ selectedSlots })
    } else {
      selectedSlots.splice(index,1);
      this.setState({ selectedSlots })
    }
    
  }

  deleteAppointments = () => {
    const { selectedSlots, appointments, today } = this.state
    Object.keys(appointments).forEach(appt=>{
      if(!selectedSlots.includes(appointments[appt].timeSlot)) delete appointments[appt]
    })
    firebaseDb.ref(`appointments/`+today).set(
      appointments, (error) => {
        if (error) {
          this.error()
        } else {
          this.setState({appointments, loading: false })
        }
      })
  }

  submitSlots = (override=false) => {
    this.setState({ loading: true, dialogOpen: false })
    const { selectedSlots, previousSlots } = this.state
    if(selectedSlots.length || override) {
      firebaseDb.ref(`timeSlots/`).set(
        selectedSlots, (error) => {
          if (error) {
            this.error()
          } else {
            
            (JSON.stringify(previousSlots) !== JSON.stringify(selectedSlots)) && this.deleteAppointments()
            this.setState({ 
              message : "Appointment slots updated",
              severity : 'success',
              showSnack : true, loading: false,
              previousSlots : [...selectedSlots]
            })
          }
        });
    } else {
      this.setState({ dialogOpen: true})
    }

    


  }

  render() {
    const { today, appointments, selectedSlots, selected, dialogOpen, loading, message, severity, showSnack } = this.state;
    const appts = appointments && this.renderappointments(appointments)
    return (
      <React.Fragment>
      {!selected ?   
      <div>
        <div className="date">{today}</div>
        { appointments && !loading && Object.keys(appts).map((key)=>{
          return (<ExpansionPanel >
          <ExpansionPanelSummary
          style={{
            color: "chocolate",
            fontSize: 'larger'
          }}
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
           <b>{key}</b>
          </ExpansionPanelSummary>
            {appts[key].map(a=>(
             <div><div style={{width: "100%"}}>
            <Button href={"tel:"+a.phoneNumber} color="primary">
             <PhoneInTalkIcon style={{paddingRight: 21}}/> <b>{ a.name }</b> - {a.phoneNumber}
            </Button>
            </div><hr/> 
            </div>
            ))}
        
        </ExpansionPanel>)
        })
      }
      
      
    </div>
    : <div className="g-row">
      <Grid container spacing={2} justify="flex-start">
      {chips.map((chip, index) => <Grid item xs>
        <Chip
          style={{
            fontFamily: "'Righteous', 'cursive'",
            fontSize: 'large',
            border: '2px solid #3f51b5',
            boxShadow: '6px 6px #888888',
            padding: 4
          }}
          id={index}
          label={chip}
          clickable
          color='primary'
          variant={`${selectedSlots.includes(chip) ? 'default' : 'outlined'}`}
          onClick={() => this.handleSelect(chip)}
        />
      </Grid>)}
      <div className="button">
        <Button variant="contained" color="secondary" style={{ width: 200}} onClick={()=>this.submitSlots(false)}>
        Submit
      </Button>
      </div>
      </Grid>
        
      </div>}
      <Backdrop open={loading} >
          <CircularProgress color="secondary" />
        </Backdrop>
        <Snackbar open={showSnack} autoHideDuration={6000} onClose={()=>this.setState({showSnack: false, message: '', severity: ''})}>
          <Alert onClose={()=>this.setState({showSnack: false, message: '', severity: ''})} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      <Dialog
          open={dialogOpen}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you to cancel all appointments for today ?
          </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              No
          </Button>
            <Button color="primary" autoFocus onClick={()=>this.submitSlots(true)} >
              Yes
          </Button>
          </DialogActions>
        </Dialog>
      <BottomNavigation
          value={selected}
          onChange={(event, newValue) => {
            this.setState({selected: newValue});
          }}
          className="nav"
          showLabels
        >
          <BottomNavigationAction label="Appointments" icon={<EventAvailableIcon />} />
          <BottomNavigationAction label="Time Slots" icon={<AlarmAddIcon />} />
        </BottomNavigation>
      </React.Fragment>

    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth })



export default connect(
  mapStateToProps,
  null
)(Doctor);
