// @flow
import React, {Component} from 'react';
import questions from './surveyQuestions';
import {
  Button,
	CustomInput,
  Form,
  FormGroup,
  Label,
  Input,
  FormText
} from 'reactstrap';

type State = {}
type Props = {}

class Survey extends Component<State, Props> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  createTextbox(question, index) {
		return <FormGroup key={index}>
          <Label>{question.question}</Label>
          <Input type={question.response_type} name={"textbox_"+index}/>
        </FormGroup>
	}

  createDropdown(question, index) {
		const options = question.options.map(option => {
      return (<option key={'dropdown_'+index+'_'+option}>{option}</option>);
    });

		return (<FormGroup key={index}>
          <Label>{question.question}</Label>
					<CustomInput type="select" id={"dropdown_" + index} name="customSelect">
          	{options}
					</CustomInput>
        </FormGroup>);
	}

  createRadio(question, index) {
    const options = question.options.map(option => {
      return (<div style={{display:"flex", flexDirection: "row"}} key={'radio_' + index + '_' + option}><FormGroup  check>
				<CustomInput type="radio" name={'radio_' + index} label={option} id={'radio_' + index + '_' + option}/>
      </FormGroup></div>);
    });

    return (<FormGroup tag="fieldset" key={index}>
      <Label>{question.question}</Label>
      {options}
    </FormGroup>);
  }

  createCheckbox(question, index) {
    return (<FormGroup check key={index}>
      <Label check>
        <Input type="checkbox"/>
        <p style={{
            marginLeft: "5px"
          }}>{question.question}</p>
      </Label>
    </FormGroup>);
  }

  createCheckboxMultiple(question, index) {
		const options = question.options.map(option => {
      return (
				<FormGroup key={'checkbox_'+index+'_'+option}>
				<Label check >
	        <CustomInput type="checkbox" id={'checkbox_'+index+'_'+option} label={option}/>
	      </Label>
			</FormGroup>
			);
    });

    return (<FormGroup key={index}>
    	<Label>{question.question}</Label>

				{options}
    </FormGroup>);
  }

  componentDidMount() {
    // console.log(questions[this.props.page]);
  }

  render() {
    const pageQuestions = questions[this.props.page];
		var i=0;
		const questionComponents = pageQuestions.map(q=>{
			switch (q.type) {
				case "textbox":
					return this.createTextbox(q, i++);
					break;
				case "checkbox-multiple":
					return this.createCheckboxMultiple(q,i++);
					break;
				case "checkbox":
					return this.createCheckbox(q,i++);
					break;
				case "radio":
					return this.createRadio(q, i++);
					break;
				case "dropdown":
					return this.createDropdown(q, i++);
				default:
					break;
			}
		});

    return (<div style={{
        width: "100%",
        border: "0px solid black",
				overflowY: "auto",
				overflowX: "hidden",
				height: "800px",
				paddingLeft:"20px",
				paddingRight:"20px"
      }}>
			{questionComponents}


		</div>);
  }
}

export default Survey;
