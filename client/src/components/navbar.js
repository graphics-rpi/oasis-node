// @flow
import React, {Component} from 'react';
import { Tooltip } from 'reactstrap';
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
  Row,
  Col
} from 'reactstrap';
import classnames from 'classnames';
import './css/navbar.css';

type State = {}
type Props = {}

class Navbar extends Component<State, Props> {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.openTooltip = this.openTooltip.bind(this);

    this.state = {
      // activeTab: '1',
      toolTipOpen: false,
      toolTipName: "",
      selectedTool: ""
    };
  }

  async toggle(tab) {
    if (this.props.activeTab !== tab) {
      if(this.props.activeTab==='2') {
      	await this.props.saveSketch();
				if(tab==='3') {
					this.props.renderModel();
				}
      }

      this.props.updatePage(tab);
      this.setState({selectedTool:"", toolTipOpen: false});
    }
  }

  openTooltip(name) {
    this.setState({
      toolTipOpen: !this.state.toolTipOpen,
      toolTipName: !this.state.toolTipOpen ? name : ""
    });
  }

  render() {
    const {data} = this.props;

    const getBtn = (btn)=>{
      const btnName = btn.name;
      const btnType = btn.type;
      const tooltip = btn.tooltip;
      const btnImage = btn.image;
      const instruction = btn.instruction;

      const name = btnName+"Btn";
      return (
        <div style={{display: "inline"}} key={name}>
          <Button outline style={{border: "none", background: this.state.selectedTool===name ? "#4ebce8" : "inherit"}} id={name} onClick={()=>{
            this.props.handleSketchClick(btnType);
            this.props.setInstruction(instruction);
            if(btn.behavior==="select") {
              this.setState({
                selectedTool: this.state.selectedTool===name ? "" : name
              });
            } else {
              this.setState({selectedTool: ""})
            }
          }}>
            <img src={require('../images/'+btnImage+'.svg')} width={"20px"} alt=""/>
          </Button>
          <Tooltip
            placement="bottom-end"
            delay={{show: 0, hide: 10}}
            isOpen={this.state.toolTipOpen && this.state.toolTipName===name}  target={name}
            toggle={()=>{this.openTooltip(name)}}>
            {tooltip}
          </Tooltip>
        </div>
      );
    }

    return (

      <div id="navbar">

        <Nav tabs>
          <NavItem className="pointer">
            <NavLink className={classnames({
                active: this.props.activeTab === '1'
              })} onClick={() => {
                this.toggle('1');
              }}>
              View Models
            </NavLink>
          </NavItem>

          <NavItem className="pointer">
            <NavLink className={classnames({
                active: this.props.activeTab === '2'
              })} onClick={() => {
                this.toggle('2');
              }}>
              Sketch Model
            </NavLink>
          </NavItem>

          <NavItem className="pointer">
            <NavLink className={classnames({
                active: this.props.activeTab === '3'
              })} onClick={() => {
                this.toggle('3');
              }}>
              Render Model
            </NavLink>
          </NavItem>

          <NavItem className="pointer">
            <NavLink className={classnames({
                active: this.props.activeTab === '4'
              })} onClick={() => {
                this.toggle('4');
              }}>
              Create Daylighting Task
            </NavLink>
          </NavItem>

          <NavItem className="pointer">
            <NavLink className={classnames({
                active: this.props.activeTab === '5'
              })} onClick={() => {
                this.toggle('5');
              }}>
              View Daylighting Simulation
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.props.activeTab}>
          <TabPane tabId="1">
						<div className="buttonBar" style={{display:"flex"}}>
              <div className="buttonContainer" style={{width: "42px", borderRight:"1px solid rgba(0,0,0,0.1)"}}>
                {data[0][0].map(getBtn)}
              </div>
							<div className="buttonContainer">
                {data[0][1].map(getBtn)}
              </div>
            </div>
          </TabPane>

          <TabPane tabId="2">
            <div className="buttonBar" style={{display:"flex"}}>
              <div className="buttonContainer" style={{width: "310px", borderRight:"1px solid rgba(0,0,0,0.1)"}}>
                {data[1][0].map(getBtn)}
              </div>
              <div className="buttonContainer" style={{width: "90px", borderRight: "1px solid rgba(0,0,0,0.1)"}}>
                {data[1][1].map(getBtn)}
              </div>
							<div className="buttonContainer">
                {data[1][2].map(getBtn)}
              </div>
            </div>
          </TabPane>

          <TabPane tabId="3">
						<div className="buttonBar" style={{display:"flex"}}>
							<div className="buttonContainer">
								{data[2][0].map(getBtn)}
							</div>
						</div>
          </TabPane>

          <TabPane tabId="4">
						<div className="buttonBar" style={{display:"flex"}}>
							<div className="buttonContainer">
								{data[3][0].map(getBtn)}
							</div>
						</div>
          </TabPane>

          <TabPane tabId="5">
						<div className="buttonBar" style={{display:"flex"}}>
							<div className="buttonContainer">
								{data[4][0].map(getBtn)}
							</div>
						</div>
          </TabPane>
        </TabContent>
    </div>
    );
  }
}

export default Navbar;
