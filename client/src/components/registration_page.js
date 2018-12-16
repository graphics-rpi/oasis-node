// @flow
import React, {Component} from 'react';
import '../css/register.css';
import {Button, Input, Form} from 'reactstrap';

type State = {}
type Props = {}

class RegistrationPage extends Component < State, Props > {
  render() {
    return (<div>
      <div id="register">
        <h1>Register</h1>

        <Form action="/api/register/" method="post">
          <center style={{width:"100%"}}>
            <Input name="username" type="text" placeholder="Username" style={{width: "300px", margin: "auto", marginBottom:"10px"}}/>
            <Input name="password" type="password" placeholder="Create Password" style={{width: "300px", margin: "auto", marginBottom:"10px"}}/>
            <Input name="passwordConf" type="password" placeholder="Retype Password" style={{width: "300px", margin: "auto", marginBottom:"10px"}}/>
          </center>

          <div style={{fontSize:'80%'}}>
            <span style={{
                textAlign: "justify",
                textJustify: "inter-word"
              }}>
              <p>
                This application is a research project for architectural modeling and daylighting simulation. Your feedback is important to help us improve this tool.
              </p><br/>
              <div id="extra_info">

                <p>Participation is voluntary. We anticipate no risk or discomfort beyond routine use of a computer and the Internet.
                </p><br/>
                <p>Construction of a model averages 5-10 minutes, depending on the complexity and depth of analysis. Your models and written feedback will be collected for use in future publications and the improvement of our tool.
                </p><br/>
                <p>No personal information is collected during the registration process. If you choose to provide an email address, researchers may contact you with optional follow-up questions. We will not share this email with anyone.</p><br/>

                <p>For the next few weeks we are offering the following incentive for current RPI students or recent RPI alums to participate in the study. On June 30th we will have a random drawing for twenty $50 prepaid VISA gift cards. Each user study participant will earn 1 entry into the drawing per different RPI dorm room model created, with a maximum of 5 entries (for making 5 or more dorm room models). To be entered into the drawing, you must have been a student at RPI during the fall 2015 or spring 2016 semesters and you must provide your RPI RCS email address.</p>

                <Input name="email" type="email" placeholder="Email (Optional)" style={{width: "300px", margin: "auto"}}/>
                <p>Your decision to not participate will not affect your course grade or any other academic outcome. You have the right to terminate your participation at any time without penalty or loss of benefits to which you are otherwise entitled. You may chose to not answer any of the questions below.</p>
                <br/>

                <p>You retain ownership of the architectural models designed in our system.</p><br/>
                For questions or concerns please contact:
                <br/>

                <div>
                  Barbara Cutler
                  <a href="mailto:cutler@cs.rpi.edu"> {' '} (cutler@cs.rpi.edu)</a>.<br/>
                  Phone: 518-276-3274<br/>
                  Rensselaer Polytechnic Institute
                  <br/>
                </div>
                <br/>

                <div>
                  Max Espinoza
                  <a href="mailto:espinm2@rpi.edu">{' '} (espinm2@rpi.edu)</a>.<br/>
                  Rensselaer Polytechnic Institute
                  <br/>
                </div>
                <br/>

                <div>
                  oasis Chen
                  <a href="mailto:chens16@rpi.edu">{' '} (chens16@rpi.edu)</a>.<br/>
                  Rensselaer Polytechnic Institute
                  <br/>
                </div>
                <br/>

                <address>
                  Chair, Institutional Review Board<br/>
                  Rensselaer Polytechnic Institute
                  <br/>
                  CII 9015110 8th Street<br/>
                  Troy, NY 12180
                  <br/>
                  (518) 276-4873
                </address><br/>
              </div>
            </span>

            <input type="checkbox" value="true" name="include" checked="checked"/>
            <label for="include">
              I am 18 years or older and give permission for my models and feedback to be used in future publications (Optional)
            </label>
            <br/>
            <br/>
          </div>


          <center>
            <Button type="submit" value="Register" style={{background: "#399ACA", border: "none", width: "300px"}}>Register</Button>
            <br/>
            <br/>
            <Button type="button" value="Already Registered?" onClick={()=>{
							window.location = '/login';
						}} style={{width:"300px"}} block>Already Registered</Button>
          </center>
        </Form>
      </div>

      <center>
        <font color="ffffff">Browers supported:</font>
        <br/>
        <img src={require('../images/chrome_icon.png')} alt=""/>
        <img src={require('../images/firefox_icon.png')} alt=""/>
      </center>
    </div>);
  }
}

export default RegistrationPage;
