// @flow
import React, {Component} from 'react';
import {
  Paper,
  Circle,
  Image
} from 'react-raphael';

type State = {}
type Props = {}

class Map extends Component<State, Props> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div style={{background: "#EAEDF1", position: "absolute", zindex: 0}} hidden={this.props.hide}>
        <Paper width={this.props.width-4} height={this.props.width}>
          <Image src={require("../images/map.png")} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} hide={this.props.hide} click={this.props.onClick} attr={{ cursor:"pointer"}}/>
          <Circle x={this.props.clickX} y={this.props.clickY} r={5} attr={{fill:"none", stroke:"black"}}/>
        </Paper>
      </div>);
  }
}

export default Map;
