import React, {
  Component
} from 'react';

import Survey from './survey';

type State = {}

type Props = {}

class ModelSelector extends Component < State, Props > {
  constructor(props) {
    super(props);
  }

  render() {
		// console.log(this.props.models);
		const models = this.props.models.map(model=>{
			return <div key={model._id + " " + model.name} style={{padding:"10px", borderBottom: "3px solid #ABABAB", marginBottom: "10px", cursor: "pointer", display:"flex"}}>
				<div style={{width:"100%"}} onClick={()=>{
					this.props.loadModelFromDB(model._id, model.name);
				}}>{model.name}</div>
			<div style={{width:"30px", border: "1px solid #ABABAB", textAlign:"center", borderRadius:"5px", color: "red", verticalAlign: "middle"}} onClick={()=>{this.props.deleteModel(model._id, model.name)}}> x</div></div>
		});
		// console.log(models);
    return (<div style={{marginLeft: "20px", marginRight:"20px", display: "flex"}}><div style={{width:"500px", marginRight:"0px", height: "800px", overflowY: "auto", overflow: "hidden"}}>{models}</div><div style={{width:"500px",padding:"0px", background:"white"}}><Survey page="modelSelection"/></div></div>);
	}
}

export default ModelSelector;
