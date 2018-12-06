// @flow
import React, {
  Component
} from 'react';

//import '../css/bootstrap.min.css';
import '../css/landing-page.css';
import '../css/extrastuff.css';
import '../css/font-awesome/css/font-awesome.min.css';


type State = {}
type Props = {}

class LandingPage extends Component < State, Props > {
  render() {
    return (
        <div id="LandingPage">
          <div className="intro-header" name="launch" id="launch">

              <div className="rowcontainer">
                <div className="col-lg-12">
                  <div className="intro-message">
                    <h1>OASIS</h1>
                    <h3>The Online Architectural Sketching Interface for Simulations</h3>
                    <hr className="intro-divider" />
                    <ul className="list-inline intro-social-buttons">
                      <li>
                        <a href="/login" className="btn btn-primary btn-xlarge">
                          Launch Application
                        </a>
                      </li>
                    </ul>
                  </div>
              </div>
            </div>
          </div>

          <div name="about" id="about">
            <div className="rowcontainer" style={{paddingLeft: "50px", paddingRight: "50px", paddingTop: "20px"}}>
              <div style={{width:"100%"}}>
              <div style={{width:"600px"}}>
              <h2 className="section-heading">About</h2>
              <p className="lead">
                Have you ever had trouble using your computer, tablet, or TV because
                of glare from the sun? Glare is one of the daylighting challenges
                that can be predicted with simulation and analysis tools. These
                issues can be minimized or corrected with thoughtful architectural
                design and the use of window shades, diffusing screens, and other
                advanced daylighting materials and technology.
              </p>

              <p className="lead">
                OASIS provides an easy-to-use interface for the design of spaces such
                as bedrooms, living rooms, and offices. This tool allows users to
                study the complex and dynamic nature of illumination from the sun and
                sky within these interior spaces at different times of the day,
                different seasons of the year, and different weather conditions.
              </p>

              <p className="lead">
                Your participation, creative designs, and feedback will help us
                improve our tool. Thanks!
              </p>
              </div>
              </div>
              <div style={{maxWidth: "600px"}}>
                <img id="glare" src={require("../images/glare.jpg")} alt=""/>
              </div>
            </div>

          </div>

          <div name="publications" id="publications">
            <div className="rowcontainer" style={{display: "flex", flexDirection: "column", paddingLeft: "50px", paddingRight: "50px", paddingTop: "20px"}}>
              <h2 className="section-heading">Publications</h2>

              <div className="pubrow">
                <a href="https://www.cs.rpi.edu/graphics/publications/nasman_autocon_2013.pdf">
                  <img src="https://www.cs.rpi.edu/graphics/publications/nasman_autocon_2013.png" alt="" />
                </a>
                <div className="pubdesc">
                  <p>Evaluation of User Interaction with Daylighting Simulation in a Tangible User Interface</p>
                  <p>Joshua Nasman and Barbara Cutler</p>
                  <p>Automation in Construction, December 2013.</p>
                </div>
              </div>

              <div className="pubrow">
                <a href="https://www.cs.rpi.edu/~cutler/publications/nasman_ccd_procams_2013.pdf">
                  <img src="https://www.cs.rpi.edu/~cutler/images/nasman_ccd_procams_2013.png" alt="" />
                </a>
                <div className="pubdesc">
                  <p>Physical Avatars in a Projector-Camera Tangible User Interface Enhance Quantitative Simulation Analysis and Engagement</p>
                  <p>Joshua Nasman and Barbara Cutler</p>
                  <p>IEEE International Workshop on Computational Cameras and Displays (formerly PROCAMS), June 2013.</p>
                </div>
              </div>

              <div className="pubrow">
                <a href="https://www.cs.rpi.edu/graphics/publications/nasman_autocon_2013.pdf">
                  <img src="https://www.cs.rpi.edu/graphics/publications/nasman_autocon_2013.png" alt="" />
                </a>
                <div className="pubdesc">
                  <p>Interpreting Physical Sketches as Architectural Models</p>
                  <p>Barbara Cutler and Joshua Nasman</p>
                  <p>Advances in Architectural Geometry 2010, September 2010.</p>
                </div>
              </div>

              <div className="pubrow">
                <a href="A Spatially Augmented Reality Sketching Interface for Architectural Daylighting Design">
                  <img src="https://www.cs.rpi.edu/~cutler/images/sheng_tvcg09_web.png" alt="" />
                </a>
                <div className="pubdesc">
                  <p>A Spatially Augmented Reality Sketching Interface for Architectural Daylighting Design</p>
                  <p>Yu Sheng, Theodore C. Yapo, Christopher Young, and Barbara Cutler</p>
                  <p>IEEE Transactions on Visualization and Computer Graphics, accepted October 2009.</p>
                </div>
              </div>
            </div>
          </div>

          <div id="acknowledgements" name="acknowledgements">
            <div className="rowcontainer" style={{display:"flex", flexDirection:"column",paddingLeft: "50px", paddingRight: "50px", paddingTop: "20px"}}>
              <h2 className="section-heading">Acknowledgements</h2>

              <p className="lead">
                OASIS is a new research tool developed and supported by computer science graduate students at Rensselaer Polytechnic Institute.<br /><br />
              </p>

              <div style={{display: "flex", flexDirection:"row", width:"100%"}}>
                <div className="ackimg">
                  <a href="https://www.cs.rpi.edu/"><img className="img-responsive logoboxes" src={require("../images/high_res_cs_logo.png" )} alt="" width="150px;" /></a>
                </div>

                <div className="ackimg">
                  <a href="https://www.rpi.edu/"><img className="img-responsive logoboxes" src={require("../images/rensselaer_seal.png")} alt="" width="150px;" /></a>
                </div>

                <div className="ackimg">
                  <a href="https://www.rpi.edu/"><img className="img-responsive logoboxes" src={require("../images/nsf.png")} alt="" width="150px;" /></a>
                </div>
              </div>
            </div>
          </div>

          <footer>
              <div className="rowcontainer">
                <div style={{width: "500px", margin:"auto"}}>
                  <ul className="list-inline">
                    <li><a href="#launch">Launch</a></li>
                    <li className="footer-menu-divider">&sdot;</li>
                    <li><a href="#about">About</a></li>
                    <li className="footer-menu-divider">&sdot;</li>
                    <li><a href="#publications">Publications</a></li>
                    <li className="footer-menu-divider">&sdot;</li>
                    <li><a href="#acknowledgements">Acknowledgements</a></li>
                  </ul>
                  <p className="copyright text-muted small">Copyright &copy; RPI Computer Graphics. Supported by NSF IIS 0845401.</p>
                </div>
            </div>
          </footer>
        </div>
    );
  }
}

export default LandingPage;
