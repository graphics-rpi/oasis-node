import React, {
  Component
} from 'react';
type State = {}

type Props = {}

class SimulationSelector extends Component < State, Props > {
  constructor(props) {
    super(props);
  }

  render() {
		// console.log(this.props.models);
		const models = this.props.models.map(model=>{
			const simVals = model.name.split('_');
			const descriptor = ' ( Date: ' + simVals[1] + '/' + simVals[2] + ', Time: ' + simVals[3] + ':' +simVals[4] + ' GMT, Weather: ' + simVals[5] + ' )';

			return <div key={model._id + " " + model.name} style={{padding:"10px", borderBottom: "3px solid #ABABAB", marginBottom: "10px", cursor: model.status ? "pointer" : "default", display:"flex"}}>
				<div style={{width:"100%"}} onClick={()=>{if(!model.status) return;
					this.props.openSimulationViewer(model.name, model.modelName);
				}}>{model.modelName}{descriptor}</div> <div style={{width:"60px"}}>{model.status ? "Ready" : "Queue"}</div>
			<div style={{width:"30px", border: "1px solid red", textAlign:"center", borderRadius:"5px", color: "red"}} onClick={()=>{if(!model.status) return; this.props.deleteSimulation(model.name, model.modelName)}}> X</div></div>
		});
		// console.log(models);
    return <div style={{marginLeft: "20px", marginRight:"20px"}}>{models}</div>
  }
}

export default SimulationSelector;
