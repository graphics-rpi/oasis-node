import path from 'path';
import React, { Component } from 'react';
import Iframe from 'react-iframe'
import { css } from 'react-emotion';
import {BeatLoader} from 'react-spinners';
import { Label, Input, Form, Row, Col, Button} from 'reactstrap';

class TaskPage extends Component {
	constructor(prop) {
		super(prop);
		this.state={
			date: "",
			time: "",
			timezone: "-12:00",
			weather: "CLEAR",
			warning: ""
		}
	}

	render() {
		return <div>
			<div style={{background:"white", borderBottom: "3px solid #ABABAB", marginLeft:"20px", marginRight:"20px"}}>

			<Form style={{background:"white"}}>
				<Label>Model Name: {this.props.modelName}</Label>
				<Row>
					<Col md={3}>
						<div>
							<Label>Date</Label>
							<Input type="date" name="date" onChange={(e)=>{this.setState({date:e.target.value})}}/>
						</div>
					</Col>
					<Col md={2}>
						<div>
							<Label>Time</Label>
							<Input type="time" name="time" onChange={(e)=>{this.setState({time:e.target.value})}}/>
						</div>
					</Col>
					<Col md={3}>
						<div>
							<Label>Timezone</Label>
						<Input type="select" onChange={(e)=>{this.setState({timezone:e.target.value})}}>
							<option value="-12:00">(GMT -12:00) Eniwetok, Kwajalein</option>
							<option value="-11:00">(GMT -11:00) Midway Island, Samoa</option>
							<option value="-10:00">(GMT -10:00) Hawaii</option>
							<option value="-9:00">(GMT -9:00) Alaska</option>
							<option value="-8:00">(GMT -8:00) Pacific Time</option>
							<option value="-7:00">(GMT -7:00) Mountain Time</option>
							<option value="-6:00">(GMT -6:00) Central Time</option>
							<option value="-5:00">(GMT -5:00) Eastern Time</option>
							<option value="-4:00">(GMT -4:00) Atlantic Time</option>
							<option value="-3:30">(GMT -3:30) Newfoundland</option>
							<option value="-3:00">(GMT -3:00) Brazil</option>
							<option value="-2:00">(GMT -2:00) Mid-Atlantic</option>
							<option value="-1:00">(GMT -1:00) Azores</option>
							<option value="+0:00">(GMT +0:00) Western Europe Time</option>
							<option value="+1:00">(GMT +1:00) Brussels</option>
							<option value="+2:00">(GMT +2:00) Kalinigrad</option>
							<option value="+3:00">(GMT +3:00) Baghdad</option>
							<option value="+3:30">(GMT +3:30) Tehran</option>
							<option value="+4:00">(GMT +4:00) Abu Dhabi</option>
							<option value="+4:30">(GMT +4:30) Kabul</option>
							<option value="+5:00">(GMT +5:00) Ekaterinburg</option>
							<option value="+5:30">(GMT +5:30) Bombay</option>
							<option value="+5:45">(GMT +5:45) Kathmandu</option>
							<option value="+6:00">(GMT +6:00) Almaty</option>
							<option value="+7:00">(GMT +7:00) Bangkok</option>
							<option value="+8:00">(GMT +8:00) Beijing</option>
							<option value="+9:00">(GMT +9:00) Tokyo</option>
							<option value="+9:30">(GMT +9:30) Adelaide</option>
							<option value="+10:00">(GMT +10:00) Eastern Australia</option>
							<option value="+11:00">(GMT +11:00) Magadan</option>
							<option value="+12:00">(GMT +12:00) Auckland</option>
						</Input>
					</div>
					</Col>
					<Col md={2}>
						<div>
							<Label>Weather</Label>
							<Input placeholder="CLEAR" type="select" onChange={(e)=>{this.setState({weather:e.target.value})}}>
				        <option value="CLEAR">Clear</option>
				        <option value="TURBID">Turbid</option>
				        <option value="INTERMEDIATE">Intermediate</option>
				        <option value="OVERCAST">Overcast</option>
				      </Input>
						</div>
					</Col>
					<Col md={2}>
						<div style={{paddingTop:"31px"}}>
							<Input type="button" value="Submit" style={{ cursor:"pointer"}} onClick={()=>{
									const {date, time, timezone, weather} = this.state;
									if(date != "" && time !="" && timezone != "" && weather != "") {
										this.props.submitDaylightingTask({date: date, time: time, timezone: timezone, weather: weather});
									} else {
										this.setState({warning: "one or more fields are not filled in."});
									}
								}}/>
						</div>
					</Col>
				</Row>
			</Form>
		</div>
		<div style={{width: "300px", margin: "auto", textAlign: "center", color: "red", padding:"10px"}}>{this.state.warning}</div>
		</div>
  }
}
export default TaskPage
