import React, {
  Component
} from 'react';
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
			<div style={{width:"30px", border: "1px solid red", textAlign:"center", borderRadius:"5px", color: "red"}} onClick={()=>{this.props.deleteModel(model._id, model.name)}}> X</div></div>
		});
		// console.log(models);
    return <div style={{marginLeft: "20px", marginRight:"20px"}}>{models}</div>
  }
}

export default ModelSelector;
