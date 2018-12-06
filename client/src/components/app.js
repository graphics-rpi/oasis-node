// @flow
import React, {Component} from 'react';
import {BrowserRouter, Route} from 'react-router-dom';
import {connect} from 'react-redux';
// import GridRow from './gridrow.js'
// import Navbar from './navbar.js';
// import SketchBox from './sketchbox.js';
import LandingPage from './landing_page.js';
import LoginPage from './login_page.js';
import RegistrationPage from './registration_page.js';
import OasisApp from './oasis_app_page.js';
import * as actions from '../actions';

type State = {}
type Props = {}

class App extends Component<State, Props> {
  constructor(props) {
    super(props);
    this.state = {
      isAuth: false
    };
    this.handleRes=this.handleRes.bind(this);
  }

  componentDidMount() {
  }

  handleRes(res) {

  }

  render() {
    return (<div>
      <BrowserRouter>
        <div>
          <Route exact={true} path="/" component={LandingPage}/>
          <Route exact={true} path="/login" component={LoginPage}/>
          <Route exact={true} path="/app" render={()=> <OasisApp actions={actions}/>}/>
          <Route exact={true} path="/registration" component={RegistrationPage}/>
        </div>
      </BrowserRouter>
    </div>);
  }
}

export default connect(null, actions)(App);
