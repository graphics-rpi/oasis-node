// @flow
import React, {Component} from 'react';
import '../css/login.css';
import {Button, Input, Form} from 'reactstrap';

type State = {}
type Props = {}

class LoginPage extends Component < State, Props > {
  render() {
    return (<div>
      <div id="login">
        <h1>OASIS</h1>
        <h4>
          <center>Online Architectural Sketching Interface<br/>for Simulations</center>
        </h4>

        <Form action="/api/login" method="post" style={{padding: "20px"}}>
          <center>
            <Input name="username" type="text" placeholder="Username" style={{width:"100%", margin: "5px 0px 10px 0px"}} />
            <Input name="password" type="password" placeholder="Password" style={{width:"100%", margin: "5px 0px 10px 0px"}} />
            <Button type="submit" value="Log in" style={{background: "#399ACA", border: "none"}} size="lg" block> Login</Button>
            <Button value="Register" style={{border: "none", marginTop: "30px"}} onClick={() => {
                window.location = '/registration';
              }} size="lg" block>
              Register
            </Button>
          </center>
        </Form>
      </div>

      <center>
        <font color="ffffff">Browers supported :
        </font>
        <br/>
        <img src={require('../images/chrome_icon.png')} alt=""/>
        <img src={require('../images/firefox_icon.png')} alt=""/>
      </center>
    </div>);
  }
}

export default LoginPage;
