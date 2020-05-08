import React, { useState } from 'react';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { authActions } from 'src/auth';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import PhonelinkRingIcon from '@material-ui/icons/PhonelinkRing';

const SignInPage = ({ signInWithPhone, auth }) => {
  const [phoneNumber, setPhone ] = useState("7276710154");
  return (
    <div className="g-row sign-in">
      <div className="g-col" style={{textAlign: 'center'}}>
        <h1 className="sign-in__heading" style={{marginLeft: -30}}>Sign in</h1>
        <TextField
          style={{width: "50%"}}
          label="Enter Phone Number"
          id="standard-number"
          required
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">+91</InputAdornment>,
          }}
          defaultValue="7276710154"
          onChange={(e)=> setPhone(e.target.value)}
          /><br/><br/>
        <Button variant="contained"
        color="primary" 
        id="sign-in-button" 
        onClick={()=>signInWithPhone(phoneNumber)}
        endIcon={<PhonelinkRingIcon/>}
        >Send OTP</Button>
      </div>
      <Backdrop open={auth.loading} >
          <CircularProgress color="secondary"  />
        </Backdrop>
    </div>
  );
};

const mapStateToProps = ({auth}) => {
  return {
    auth
    }
}
const mapDispatchToProps = {
  signInWithPhone: authActions.signInWithPhone,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SignInPage)
);
