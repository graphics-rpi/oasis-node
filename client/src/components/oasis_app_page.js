// @flow
import React, {Component} from 'react';
// import SketchPad from './sketchpad.js';
import Navbar from './navbar.js';
import Sketch from './sketch.js';
import ThreeScene from './render.js';
import ModelSelector from './model_selection';
import SimulationSelector from './simulation_selection';
import TaskPage from './task_page';
import Cookies from 'universal-cookie';
import * as util from './sketchUtil.js';
import * as randomName from './random_name';

type State = {}
type Props = {}

class OasisApp extends Component < State, Props > {
	constructor(props) {
		super(props);
		const width = 500;
		const height = 500;
		const radius = 200;

		this.sketch = React.createRef();
		this.state = {
			currentPage: '1',
			width: width,
			height: height,
			radius: radius,
			buttonPressed:"",
			instruction: "",
			currentSketch: "",
			sketchState: this.createNewSketchState(),
			models: [],
			simulations: [],
			renderPage: "",
			modelRenderStatus: false,
			viewingSimulation: {status:false}
		};
		this.setButtonPressed = this.setButtonPressed.bind(this);
		this.changeSketchState = this.changeSketchState.bind(this);
		this.handleSketchClick = this.handleSketchClick.bind(this);
		this.updateInstruction = this.updateInstruction.bind(this);
		this.saveSketch = this.saveSketch.bind(this);
		this.clearSketch = this.clearSketch.bind(this);
		this.updatePage = this.updatePage.bind(this);
		this.createNewSketchState = this.createNewSketchState.bind(this);

		this.loadModelFromDB = this.loadModelFromDB.bind(this);
		this.saveModelToDB = this.saveModelToDB.bind(this);
		this.getUserModels = this.getUserModels.bind(this);
		this.deleteModel = this.deleteModel.bind(this);
		this.deleteSimulation= this.deleteSimulation.bind(this);
		this.renderModel = this.renderModel.bind(this);
		this.checkRenderStatus = this.checkRenderStatus.bind(this);
		this.checkSimulationStatus = this.checkSimulationStatus.bind(this);
		this.submitDaylightingTask = this.submitDaylightingTask.bind(this);
		this.openSimulationViewer = this.openSimulationViewer.bind(this);
	}

	createNewSketchState() {
		const width = 500;
		const height = 500;
		const radius = 200;

		return {
			draw_mode: "NEUTRAL",
			paper_children: [],
			mouseX: 0,
			mouseY: 0,
			drag_start: [
				0, 0
			],
			table: "",
			selectedFurnitureKey: "",
			activeFurniture: {},
			wallWindows: {},
			windows: {},
			skylights: {},
			furnitures: {},
			walls: {},
			furnitureTransform: "",
			hoveredValueKey: "",
			foundObject: false,
			longitude: 42.73,
			latidude: -73.69,
			mapMarkerX: 148,
			mapMarkerY: 194.875,
			offsetNorth: 0,
			southLocation: {x: width/2, y: height/2 + radius+radius/10},
			northLocation: {x: width/2, y: height/2 - radius-radius/10},
			modelName: randomName.get_random_name(),
			sketchChanged: false
		}
	}

	updatePage(newpage) {
		const {sketchState} = this.state;
		sketchState.draw_mode = "NEUTRAL";
		if(newpage==='1') {
			this.getUserModels(this.state.authToken);
		} else {
			this.setState({currentPage: newpage, sketchState: sketchState, modelRenderStatus: false, viewingSimulation: {status:false}});
		}
	}

	setButtonPressed(btn) {
		this.setState({buttonPressed: btn});
	}

	updateInstruction(instruction) {
		this.setState({instruction: instruction});
	}

	changeSketchState(newState) {
		const {sketchState} = this.state;
		Object.keys(newState).forEach(key => {
			sketchState[key] = newState[key];
		});

		this.setState({
			sketchState: sketchState,
			modelRenderStatus: false
		});
	}

	saveSketch() {
		if(this.state.sketchState.sketchChanged) {
			const key = this.state.authToken;
			const sketchFile = this.sketch.current.generateSketchFile();
			const wallFile = this.sketch.current.generateWallFile();
			this.setState({currentSketch: sketchFile});
			this.props.actions.saveModel(key, sketchFile, wallFile, this.state.sketchState.modelName)((res,b,c)=>{
				console.log("done",b,c);
			});
			const {sketchState} = this.state;
			sketchState.sketchChanged = false;
			this.setState({sketchState:sketchState});
		}

	}

	clearSketch() {
		this.setState({currentSketch: "", sketchState: this.createNewSketchState(), currentPage: '2', modelRenderStatus: false});
	}

	handleSketchClick(btnName) {
		switch(btnName) {
			case "WALL":
				this.sketch.current.toggleWallMode()
				break;
			case "WINDOW":
				this.sketch.current.toggleWindowMode();
				break;
			case "CLOSET":
				this.sketch.current.addFurniture(3);
				break;
			case "DESK":
				this.sketch.current.addFurniture(2);
				break;
			case "BED":
				this.sketch.current.addFurniture(1);
				break;
			case "SKYLIGHT":
				this.sketch.current.addFurniture(0);
				break;
			case "REMOVE":
				this.sketch.current.toggleRemoveMode();
				break;
			case "ORIENTATION":
				this.sketch.current.toggleOrientationMode();
				break;
			case "LOCATION":
				this.sketch.current.toggleLocationMode();
				break;
			case "ADD MODEL":
				this.clearSketch();
				break;
			default:
				break;
		}
	}

	componentDidMount() {
		const cookies = new Cookies();
		const token = cookies.get('authToken');

		// if we just authed
		if(window.location.search) {
			const newToken = window.location.search.split('=')[1];
			// window.location = window.location.pathname;
			// if(!token) {
				cookies.set('authToken', newToken, {
					maxAge: 24*60*60*1000,
					expires: new Date(Date.now()+ 24*60*60*1000)
				});
			// }
			window.location = window.location.pathname;
		} else {
			if(token) {
				console.log("token verified");
				// verify token
			} else {
				console.log("no token must sign in again");
				window.location = '/login';
			}
		}
		const newToken = cookies.get('authToken');
		this.setState({authToken: newToken ? newToken: ""});
		this.getUserModels(newToken);
		this.checkSimulationStatus(newToken);
	}

	createSketch(config="") {
		return (<div><div style={{width: this.state.width, marginLeft: "20px", marginTop: "0px", border: "2px solid #ADADAD"}}>
			{<Sketch width={this.state.width} height={this.state.width} radius={this.state.radius} stroke_width={5} stroke_width_selected={10} updateState={this.changeSketchState} state={this.state.sketchState} ref={this.sketch} config={config}/>}
			</div>
			<div style={{textAlign:"center", width: this.state.width, marginLeft:"20px"}}>{this.state.sketchState.draw_mode==="NEUTRAL" ? "" : this.state.instruction} {this.state.sketchState.draw_mode==="LOCATION" ? util.getLocationString(this.state.sketchState.longitude, this.state.sketchState.latidude) : ""}</div></div>);
	}

	createSelector() {
		return (<div>
			<ModelSelector loadModelFromDB={this.loadModelFromDB} deleteModel={this.deleteModel} models={this.state.models}/>
		</div>);
	}

	saveModelToDB() {
		const key = this.state.authToken;
		this.setState({modelRenderStatus:false});
		this.props.actions.saveModel(key, this.sketch.current.generateSketchFile(), this.sketch.current.generateWallFile(), this.state.sketchState.modelName)((res)=>{
			// console.log(res);
		});
	}

	deleteModel(id, modelName) {
		const {models} = this.state;
		const key = this.state.authToken;
		this.props.actions.deleteModel(key, id, modelName)(res=>{
		});

		const newModels = [];
		models.forEach(m=>{
			if(m._id!==id) {
				newModels.push(m);
			}
		});
		this.setState({models:newModels, sketchState:this.createNewSketchState(), currentSketch: ""});
	}

	deleteSimulation(simulationName, modelName) {
		// console.log(simulationName, modelName);
		const {simulations} = this.state;
		const key = this.state.authToken;
		this.props.actions.deleteSimulation(key, simulationName, modelName)(res=>{
			// console.log(res);
		});

		const newSims = [];
		simulations.forEach(s=>{
			if(s.name!==simulationName) {
				newSims.push(s);
			}
		});
		this.setState({simulations:newSims, sketchState:this.createNewSketchState(), currentSketch: ""});
	}

	loadModelFromDB(id,modelName) {
		const key = this.state.authToken;
		this.props.actions.getModel(key, id, modelName)((res)=>{
			const sketchFile = res.payload.data.sketchFile;
			// console.log(sketchFile);
			// this.sketch.current.loadSketchFile(sketchFile);
			this.setState({currentSketch: sketchFile, sketchState: this.createNewSketchState()});
			this.updatePage('2');
			this.sketch.current.loadSketchFile(sketchFile);
		});
	}

	getUserModels(token) {
		this.props.actions.getUserModels(token)((res)=>{
			this.forceUpdate(()=>{this.setState({models:res.payload.data.models.reverse(), currentPage: '1'})});
		});
	}

	checkRenderStatus() {
		const key = this.state.authToken;
		setInterval(() => {
			const {modelRenderStatus} = this.state;
			const activeModel = this.state.sketchState.modelName;
			if(activeModel && !modelRenderStatus) {
				this.props.actions.checkRenderStatus(key, activeModel)((res)=>{
					if(res.payload.data.status===1) {
						this.setState({modelRenderStatus: true});
					}
				});
			}
		}, 1 * 1000);
	}

	checkSimulationStatus(token="") {
		const key = token!="" ? token : this.state.authToken;
		this.props.actions.getUserSimulations(key)(res=>{
			// console.log(res);
			this.setState({simulations: res.payload.data.simulations});
		});
		setInterval(() => {
			this.props.actions.getUserSimulations(key)((res)=>{
				if(res.payload.data.status===1) {
					// console.log(res);
					this.setState({simulations: res.payload.data.simulations});
				}
			})
		}, 15 * 1000);
	}

	renderModel() {
		const key = this.state.authToken;
		const activeModel = this.state.sketchState.modelName;
		if(activeModel) {
			// this.checkRenderStatus();
			this.props.actions.renderModel(key, activeModel)((res)=>{
				this.checkRenderStatus();
			});
		}
	}

	submitDaylightingTask(formdata) {
		const key = this.state.authToken;
		const activeModel = this.state.sketchState.modelName;
		const {time, date, timezone, weather} = formdata;
		var t = time.split(':');
		var d = date.split('-');
		var tz = timezone.split(':');

		// convert to gmt
		var jsdate = new Date(Number(d[0]), Number(d[1]), Number(d[2]), Number(t[0]), Number(t[1]));
		jsdate.setHours(jsdate.getHours()+Number(tz[0]));
		jsdate.setMinutes(jsdate.getMinutes()+Number(tz[1]));

		const params = ({
			hour: jsdate.getHours(),
			minute: jsdate.getMinutes(),
			second: jsdate.getSeconds(),
			day: jsdate.getDate(),
			month: jsdate.getMonth()===0 ?  12 : jsdate.getMonth(),
			year: jsdate.getYear(),
			weather: weather
		});

		this.props.actions.createSimulation(key,activeModel,params)((res)=>{
			this.updatePage('5');
		});
	}

	openSimulationViewer(simulationName, modelName, mode="fcv") {
		this.setState({viewingSimulation: {status: true, simulationName: simulationName, modelName: modelName, colorMode: mode}});
	}

	render() {
		const menu = [
			{name: "Select Models"},
			{name: "Model Sketch"},
			{name: "Render 3D"},
			{name: "Create Daylighting Task"},
			{name: "View and Analysis"}
		];

		 const data = [[[{name: "newmodel", tooltip: "Create New Model", type:"ADD MODEL", behavior:""}]],[[{name: "wall", tooltip: "Create Wall", type: "WALL", behavior: "select", instruction: "Create wall by dragging a line inside the circle"}, {name: "window", tooltip: "Create Window", type: "WINDOW", behavior: "select", instruction: "Create window by dragging a line along side existing walls (must first create a wall)"}, {name: "closet", tooltip: "Create Closet", type: "CLOSET", behavior: "", instruction: "Click and drag center icon to translate, click and drag side icon to rotate"}, {name: "desk", tooltip: "Create Desk", type: "DESK", behavior: "", instruction: "Click and drag center icon to translate, click and drag side icon to rotate"}, {name: "bed", tooltip: "Create Bed", type: "BED", behavior: "", instruction: "Click and drag center icon to translate, click and drag side icon to rotate"}, {name: "skylight", tooltip: "Create Skylight", type: "SKYLIGHT", behavior: "", instruction: "Click and drag center icon to translate, click and drag side icon to rotate, click and drag right icon to scale in x direction, click and drag on bottom icon to scale in y direction"}, {name: "remove", tooltip: "Remove Mode", type: "REMOVE", behavior: "select", instruction: "Click on any object to remove it"}], [{name: "map", tooltip: "Change Model Location", type: "LOCATION", behavior: "select", instruction: "Click on approximate geographic location of your model"}, {name: "compass", tooltip: "Change Model Orientation", type: "ORIENTATION", behavior: "select", instruction: "Click and drag to orient the surface"}], [{name: "info", tooltip: "Info", type: "INFO", behavior: "", instruction: "Click on questions for answers"}, {name: "help", tooltip: "Help", type: "HELP", behavior: "", instruction: "Unsure how to do something? Click on questions for answers"}, {name: "bugs", tooltip: "Report Bugs", type: "BUG", behavior: "", instruction: "Fill out bug form and submit"}]]];

		var page = "";
 		switch(this.state.currentPage) {
			case '1':
				page = this.createSelector();
				break;
 			case '2':
 				page = this.createSketch(this.state.currentSketch);
 				break;
			case '3':
				page = <ThreeScene
					modelId="null"
					modelName={this.state.sketchState.modelName} modelRenderStatus={this.state.modelRenderStatus}
					checkRenderStatus={this.checkRenderStatus}
					type="geometry"/>
				break;
			case '4':
				page = <TaskPage submitDaylightingTask={this.submitDaylightingTask} modelName={this.state.sketchState.modelName}/>
				break;
			case '5':
				page = this.state.viewingSimulation.status ? <ThreeScene type="texture" modelName={this.state.viewingSimulation.modelName} simulationName={this.state.viewingSimulation.simulationName} colorMode={this.state.viewingSimulation.colorMode}/> :
				<SimulationSelector models={this.state.simulations}  deleteSimulation={this.deleteSimulation} openSimulationViewer={this.openSimulationViewer}/>
 			default:
 				break;
 		}

		return (
			<div style={{background:"white", overflow: "hidden"}}>
				<div style={{height: Math.max(window.innerHeight, 600), overflow: "hidden"}}>
					<Navbar menu={menu}
					data={data}
					buttonPressed={this.setButtonPressed}
					handleSketchClick = {this.handleSketchClick}
					saveSketch = {this.saveSketch}
					clearSketch = {this.clearSketch}
					setInstruction={this.updateInstruction}
					updatePage={this.updatePage}
					saveModelToDB={this.saveModelToDB}
					activeTab={this.state.currentPage}
					updateModels={()=>{this.getUserModels(this.state.authToken)}}
					renderModel={this.renderModel}
					checkRenderStatus={this.checkRenderStatus}
					/>
					{page}
				</div>
			</div>
		);
	}
}

export default OasisApp;
