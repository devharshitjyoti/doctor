import React from 'react';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { authActions, getAuth } from 'src/auth';
import Header from '../components/header';
import RequireAuthRoute from '../components/require-auth-route';
import RequireUnauthRoute from '../components/require-unauth-route';
import SignInPage from '../pages/sign-in';
import TasksPage from '../pages/tasks';
import Doctor from '../pages/doctor';
import Divider from '@material-ui/core/Divider';
import "./app.css"
const App = ({authenticated, signOut, isDoctor}) => (
  <div>
    <Header
      authenticated={authenticated}
      signOut={signOut}
    />
    <Divider/>
    <main className="container">
      {isDoctor ? <RequireAuthRoute authenticated={authenticated} exact path="/" component={Doctor}/>
      : <RequireAuthRoute authenticated={authenticated} exact path="/" component={TasksPage}/>}
      <RequireUnauthRoute authenticated={authenticated} path="/sign-in" component={SignInPage}/>
    </main>
  </div>
);


const mapStateToProps = getAuth;

const mapDispatchToProps = {
  signOut: authActions.signOut
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);
