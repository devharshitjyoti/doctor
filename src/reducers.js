import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import { authReducer } from './auth';
import history from './history';


export default combineReducers({
  auth: authReducer,
  router: connectRouter(history),
});
