import path from 'path';
import React, { Component } from 'react';
import Iframe from 'react-iframe'
import { css } from 'react-emotion';
import {BeatLoader} from 'react-spinners';
import Survey from './survey';


class Render extends Component {

render() {
		var viewerUrl = "https://oasis.cs.rpi.edu/viewer/";
		if(this.props.type==="geometry") {
			viewerUrl += ("?id="+this.props.modelId); // user id
			viewerUrl += ("?model="+this.props.modelName); // model name
			viewerUrl += ("?type="+this.props.type); // texture or geometry
		} else if(this.props.type==="texture") {
			viewerUrl += ("?id="+this.props.modelId); // user id
			viewerUrl += ("?model="+this.props.modelName+'.'+this.props.simulationName + '.' + this.props.colorMode); // model name
			viewerUrl += ("?type="+this.props.type); // texture or geometry
		}

		var viewer = (<Iframe url={viewerUrl}
						width="510px"
						height="510px"
						id="render"
						display="initial"
						position="relative"/>);

		if(!this.props.modelRenderStatus && this.props.type!=="texture") {
			viewer = (<div style={{width:"500px", height:"500px", border: "3px solid #ABABAB"}}>
			<center style={{marginTop:"240px"}}><BeatLoader size={15} sizeUnit={"px"} color={'#36D7B7'}/></center></div>);
		} else {
			viewer = (<div style={{width:"500px", height:"500px", border: "3px solid #ABABAB", overflow: "hidden"}}><Iframe url={viewerUrl}
							width="490px"
							height="500px"
							id="render"
							display="initial"
							position="relative"/></div>);
		}


    return(
      <div style={{width:"1000px", display:"flex", marginLeft:"auto", marginRight:"auto"}}>
				<div style={{marginLeft:"20px"}}>{viewer}</div>
				<div style={{width:"500px",padding:"0px", background:"white"}}><Survey page={this.props.type==="geometry" ? "modelRender" : "simulationRender"}/></div>
			</div>
    )
  }
}
export default Render
