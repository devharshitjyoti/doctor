import { firebaseAuth } from "../firebase"
import { INIT_AUTH, SIGN_IN_SUCCESS, SIGN_OUT_SUCCESS, SIGN_IN_ERROR } from './action-types';


export const AuthState = {
  authenticated: false,
  id: null,
  user: null,
  loading: false,
  isDoctor: false
};


export function authReducer(state = AuthState, {payload, type}) {
  switch (type) {
    case INIT_AUTH:
    case SIGN_IN_SUCCESS:
      return {
        ...state,
        authenticated: !!payload,
        id: payload ? payload.uid : null,
        user: payload,
        loading:false,
        isDoctor : firebaseAuth.currentUser && ["+917276710154"].includes(firebaseAuth.currentUser.phoneNumber)
      };
      case SIGN_IN_ERROR:
      return {
        ...state,
        loading:false
      };
      case "LOADING":
      return {
        ...state,
        loading: payload
      };

    case SIGN_OUT_SUCCESS:
      return AuthState;

    default:
      return state;
  }
}
