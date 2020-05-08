import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import './header.css';


const Header = ({authenticated, signOut}) => (
  <header className="header">
     <Grid container spacing={2}>
        <Grid item xs={8}>
          <h3 className="header__title">Dr. Mehta's Appointment</h3>
        </Grid>
        <Grid item xs={4}>
           {authenticated ? <Button style={{marginTop: 14,
    fontWeight: "bolder" }} color="secondary" onClick={signOut}>Sign out</Button> : null}
        </Grid>
        </Grid>
        
          
         
  </header>
);



export default Header;
