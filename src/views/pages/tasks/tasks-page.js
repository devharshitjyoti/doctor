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
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

//const chips = ["11:00 - 11:15 AM", "11:16 - 11:20 AM", "11:21 - 11:25 AM", "11:26 - 11:30 AM"];
const todaysDdate = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + '-' + mm + '-' + yyyy;
  return today
}
export class TasksPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      chips: null,
      appointmentsAll: [],
      selected: null,
      dialogOpen: false,
      today: todaysDdate(),
      name: null,
      appointments: null,
      loading: false,
      noChangeAllowed: false,
      showSnack: false,
      message: '',
      severity: '',
      lastSelected: null
    }
  }

  renderappointments = (app, chips, val) =>{
    var obj = {};
    Object.keys(app).forEach(a=>{
      if(obj[app[a].timeSlot]) 
        obj[app[a].timeSlot]+=1
      else obj[app[a].timeSlot]= 1
    })
    chips.forEach((c,index)=>{
      if(obj[c] >=5 && !(val && val.timeSlot === c) ) chips.splice(index,1)
    })
    return chips;
  }
  
  componentWillMount() {
    const { today } = this.state;
    const { uid } = this.props.auth.user;
    this.setState({ loading: true })
    firebaseDb.ref(`timeSlots`).once('value').then(snapshot1=>{
      let chips = snapshot1.val();
      firebaseDb.ref(`appointments/${today}`).once('value').then(snapshot => {
        const appointments = snapshot.val();
        if(appointments) {
        const val = appointments && appointments[uid];
        chips = this.renderappointments(appointments, chips, val);
        let selected = null;
        let message = null;
        let severity = null;
        let showSnack = false;
        let name = '';
        if (val) {
          selected = chips && chips.indexOf(val.timeSlot)
          message = "Your appointment is booked for " + val.timeSlot + " today."
          severity = 'success';
          showSnack = true
          name = val.name
        }
        this.setState({
          appointmentsAll: appointments,
          appointments: val,
          selected: selected === -1 ? null : selected,
          loading: false,
          noChangeAllowed: val && val.changed > 3,
          message,
          severity,
          showSnack,
          name,
          chips
        })
      } else {
        this.setState({
          loading: false,
          chips
        })
      }
      }).catch((err)=>this.error(err))
    }).catch((err)=>this.error(err))
    
  }

  error = (err) =>{
    console.log(err)
    this.setState(
    { 
      message :"Something Went Wrong",
      severity: 'error',
      showSnack : true, 
      loading: false,
    })
  }


  handleClose = () => this.setState({ selected: this.state.lastSelected, dialogOpen: false, loading: false })
  handleConfirm = () => {
    this.setState({ dialogOpen: false })
    this.writeUserData()
  }
  handleSelect = (id) => {
    this.setState({ dialogOpen: true, selected: id, lastSelected: this.state.selected })
  }

  writeUserData = () => {
    this.setState({ loading: true })
    const { uid, phoneNumber } = this.props.auth.user;
    const { today, selected, name, appointments, appointmentsAll, chips } = this.state;
    let changed = appointments ? ++appointments.changed : 0
    const appointment = {
      [today]: {
        [uid]: {
          timeSlot: chips[selected],
          username: uid,
          phoneNumber,
          name,
          changed
        }
      }
    }
    if(appointmentsAll && Object.keys(appointmentsAll).length) {
      let updates = {};
      updates['/appointments/'+today+'/'+uid] = appointment[today][uid];
      firebaseDb.ref().update(updates)
      .then(()=>this.setState({ 
          message: "Your appointment is booked for " + chips[selected] + " today.",
          severity: 'success',
          showSnack: true,
          noChangeAllowed: changed >=3,
        appointmentsAll: {...appointmentsAll,  ...appointment[today]}, 
        appointment: appointment[today][uid], 
        loading: false }))
      .catch(()=>this.error())
    } else {
      firebaseDb.ref(`appointments/`).set(
        appointment, (error) => {
          if (error) {
            this.error()
          } else {
            this.setState({ message: "Your appointment is booked for " + chips[selected] + " today.",
            severity: 'success',
            showSnack: true,
            noChangeAllowed: changed >=3,
            appointmentsAll: {...appointmentsAll,  ...appointment[today]}, 
              appointment: appointment[today][uid], loading: false })
          }
        })
        
    }

    


  }

  render() {
    const { noChangeAllowed, selected, chips, dialogOpen, name, loading, message, severity, showSnack } = this.state;
    return (
      <div className="g-row">
        <Grid container spacing={3}>

          {chips && chips.map((chip, index) => <Grid item xs>
            <Chip
              disabled={noChangeAllowed}
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
              variant={`${index !== selected ? 'outlined' : 'default'}`}
              onClick={(index !== selected) ? () => this.handleSelect(index) : null}
            />
          </Grid>)}
        </Grid>
        <Dialog
          open={dialogOpen}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you to confirm the seleted slot time for appointment ?
          </DialogContentText>
            <DialogContentText id="alert-dialog-description">
              <div className="ask">If Yes, What will be the name of the patient ?</div>
              <Divider />
              <TextField id="outlined-basic" label="Patient's name" variant="outlined"
                value={name} onChange={(e) => this.setState({ name: e.target.value })} />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              No
          </Button>
            <Button disabled={!name} onClick={this.handleConfirm} color="primary" autoFocus>
              Yes
          </Button>
          </DialogActions>
        </Dialog>
        <Backdrop open={loading} >
          <CircularProgress color="secondary" />
        </Backdrop>
        <h5> <span style={{ color: 'red' }}>* * </span>
          {!noChangeAllowed ? "You can change you appointment time only 3 times in a day"
            : "You have changed you appointment 3 times. No further changes allowed"
          }
        </h5>
        <Snackbar open={showSnack} 
        autoHideDuration={6000} 
        onClose={()=>this.setState({showSnack: false, message: '', severity: ''})}>
          <Alert onClose={()=>this.setState({showSnack: false, message: '', severity: ''})} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      </div>

    );
  }
}

const mapStateToProps = ({ auth }) => ({ auth })



export default connect(
  mapStateToProps,
  null
)(TasksPage);
