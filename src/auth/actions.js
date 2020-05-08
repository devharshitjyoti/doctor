import firebase from 'firebase';
import { firebaseAuth } from 'src/firebase';
import {
  INIT_AUTH,
  SIGN_IN_ERROR,
  SIGN_IN_SUCCESS,
  SIGN_OUT_SUCCESS
} from './action-types';


function authenticate(provider) {
  return dispatch => {
    firebaseAuth.signInWithRedirect(provider)
      .then(result => dispatch(signInSuccess(result)))
      .catch(error => dispatch(signInError(error)));
  };
}


export function initAuth(user) {
  return {
    type: INIT_AUTH,
    payload: user
  };
}


export function signInError(error) {
  return {
    type: SIGN_IN_ERROR,
    payload: error
  };
}


export function signInSuccess(result) {
  return {
    type: SIGN_IN_SUCCESS,
    payload: result.user
  };
}



export function signInWithPhone(phoneNumber) {
  
    const recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
      'size': 'invisible',
      });
      return dispatch => {
        dispatch({
          type: 'LOADING',
          payload: true
        })
        return firebaseAuth.signInWithPhoneNumber("+91"+phoneNumber, recaptchaVerifier)
      .then( confirmationResult => {
        const verificationCode = window.prompt('Please enter the verification ' +
        'code that was sent to your mobile device.');
        confirmationResult.confirm(verificationCode)
        .then((result)=>dispatch(signInSuccess(result)))
        .catch(() => {
          window.location.reload();
          dispatch(signInError("Wrong Captcha Code"))
        })
        
      })
        .catch(() => dispatch(signInError("Wrong Code")))
    }
}


export function signInWithGoogle() {
  return authenticate(new firebase.auth.GoogleAuthProvider());
}


export function signInWithTwitter() {
  return authenticate(new firebase.auth.TwitterAuthProvider());
}


export function signOut() {
  return dispatch => {
    firebaseAuth.signOut()
      .then(() => dispatch(signOutSuccess()));
  };
}


export function signOutSuccess() {
  return {
    type: SIGN_OUT_SUCCESS
  };
}
