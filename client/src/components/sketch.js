import React, {Component} from 'react';
import * as util from './sketchUtil.js';
import Map from './map.js';
import {
  Paper,
  Set,
  Circle,
  Image,
  Rect,
  Path,
  Text
} from 'react-raphael';

type State = {
  paper_children: []
};

type Prop = {
  width: 302,
  height: 302,
  radius: 150,
  stroke_width: 2,
  stroke_width_selected: 5
};

class Sketch extends Component<State, Prop> {
  constructor(props) {
    super(props);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragMove = this.onDragMove.bind(this);

    this.generateTabletop = this.generateTabletop.bind(this);
    this.createTable = this.createTable.bind(this);
    this.onDragHelper = this.onDragHelper.bind(this);
    this.onMouseHover = this.onMouseHover.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);
    this.pickElement = this.pickElement.bind(this);

    this.removeHoveredElement = this.removeHoveredElement.bind(this);

    this.addFurniture = this.addFurniture.bind(this);
    this.createSkylight = this.createSkylight.bind(this);
    this.createWindow = this.createWindow.bind(this);
    this.createWall = this.createWall.bind(this);
    this.createFurniture = this.createFurniture.bind(this);
    // this.removeTransformCtrl = this.removeTransformCtrl.bind(this);
    this.onClickDraggable = this.onClickDraggable.bind(this);

    // toggle modes
    this.toggleWindowMode = this.toggleWindowMode.bind(this);
    this.toggleWallMode = this.toggleWallMode.bind(this);
    this.toggleRemoveMode = this.toggleRemoveMode.bind(this);
    this.toggleFurnitureMode = this.toggleFurnitureMode.bind(this);
    this.toggleOrientationMode = this.toggleOrientationMode.bind(this);
    this.toggleLocationMode = this.toggleLocationMode.bind(this);

    // removes element from children
    this.elementsWithoutKey = this.elementsWithoutKey.bind(this);

    // returns the location on the selected furniture
    this.checkFurnitureClickLocation = this.checkFurnitureClickLocation.bind(this);

    // add/remove transform ctrl to selected furniture
    this.deselect = this.deselect.bind(this);
    this.select = this.select.bind(this);
    this.orderPaperChildren = this.orderPaperChildren.bind(this);

    // generate wall files
    this.generateWallFile = this.generateWallFile.bind(this);
    this.generateWallFileHelper = this.generateWallFileHelper.bind(this);

    this.generateSketchFile = this.generateSketchFile.bind(this);
    this.loadSketchFile = this.loadSketchFile.bind(this);
  }

  onMouseMove(e) {
    const offset = document.getElementById("paper_container").getBoundingClientRect();

    this.props.updateState({
      mouseX: e.pageX - offset.x,
      mouseY: e.pageY - offset.y
    });
  }

  isValidLine(mouseX, mouseY) {
    return Math.sqrt(Math.pow(this.props.width/2 - mouseX, 2) + Math.pow(this.props.height/2 - mouseY, 2)) < this.props.radius && Math.sqrt(Math.pow(this.props.width/2 - this.props.state.drag_start[0], 2) + Math.pow(this.props.height/2 - this.props.state.drag_start[1], 2)) < this.props.radius;
  }

  // returns window path attached to nearest wall
  getNearestWall(win) {
    const {walls} = this.props.state;
    const windowPoints = util.extractPathPoints(win);
    const windowDir = util.convertLine2Vector(windowPoints.startPoint, windowPoints.endPoint);

    const candidates = [];

    Object.keys(walls).forEach(key => {
      const element = walls[key]
      const wallPoints = util.extractPathPoints(element);
      const wallDir = util.convertLine2Vector(wallPoints.startPoint, wallPoints.endPoint);
      const angle = Math.min(util.angleBtwVec(windowDir, wallDir), util.angleBtwVec(util.negateVec(windowDir), wallDir)) * (180 / Math.PI);
      if (angle <= 30) {
        candidates.push(element);
      }
    });

    var nearestWall = null;
    var nearestDist = 1000000;
    var _start = windowPoints.startPoint;
    var _end = windowPoints.endPoint;
    var _mid = [
      (_start[0] + _end[0]) / 2.0,
      (_start[1] + _end[1]) / 2.0
    ];

    if (candidates.length === 0) {
      return null;
    }

    candidates.forEach(candidate => {
      const pts = util.extractPathPoints(candidate);
      const start = pts.startPoint;
      const end = pts.endPoint;
      const dist = util.getDistancePtOnLineSeg(_mid, start, end);

      if (nearestDist > dist) {

        nearestDist = dist;
        nearestWall = candidate;
      }
    });

    if (nearestDist > 30) {
      return null;
    }

    const ptsWall = util.extractPathPoints(nearestWall);
    const slopeWall = util.getSlope(ptsWall.startPoint, ptsWall.endPoint);
    const slopePer = (slopeWall !== 0)
      ? (-1.0 * (1.0 / slopeWall))
      : (-1.0 * (1.0 / .001));

    const length = Math.sqrt(Math.pow(_end[0] - _start[0], 2) + Math.pow(_end[1] - _start[1], 2));
    const inter = util.line_intersection(slopeWall, ptsWall.startPoint, slopePer, _mid);

    const dirVec = util.convertLine2Vector(ptsWall.startPoint, ptsWall.endPoint);
    const negVec = util.negateVec(dirVec);

    // Get start point
    const resStart = [
      inter[0] + dirVec[0] * 0.5 * length,
      inter[1] + dirVec[1] * 0.5 * length
    ];

    const resEnd = [
      inter[0] + negVec[0] * 0.5 * length,
      inter[1] + negVec[1] * 0.5 * length
    ];

    const fStart = util.inbetween(ptsWall.startPoint, resStart, ptsWall.endPoint)
      ? [
        resStart[0], resStart[1]
      ]
      : ptsWall.endPoint;

    const fEnd = util.inbetween(ptsWall.startPoint, resEnd, ptsWall.endPoint)
      ? [
        resEnd[0], resEnd[1]
      ]
      : ptsWall.startPoint

    var per_away = .95;
    var shortenEx = fEnd[0] + (fStart[0] - fEnd[0]) * per_away;
    var shortenEy = fEnd[1] + (fStart[1] - fEnd[1]) * per_away;
    var shortenSx = fStart[0] + (fEnd[0] - fStart[0]) * per_away;
    var shortenSy = fStart[1] + (fEnd[1] - fStart[1]) * per_away;

    const newWinStr = "M" + shortenSx + ',' + shortenSy + "L" + shortenEx + ',' + shortenEy;

    const newWinattr = {
      'stroke': '#4ebce8',
      'stroke-width': this.props.stroke_width ? this.props.stroke_width : 2
    }

    const key = this.props.state.draw_mode + "_" + this.props.state.paper_children.length + '_' + (new Date()).getUTCMilliseconds();


    return this.createWindow(newWinStr, newWinattr, key, nearestWall.props.d, nearestWall.key);
  }

  removeHoveredElement() {
    const {foundObject, draw_mode} = this.props.state;
    if (draw_mode !== "REMOVE") {
      return;
    }

    const {paper_children, windows, walls, wallWindows, furnitures, skylights} = this.props.state;

    const newPaperChildren = [];

    for (var childIndex in paper_children) {
      const objType = paper_children[childIndex].props.objType;
      const objKey = paper_children[childIndex].key;
      var isWindowOnSelected = false;
      if(objType==="WINDOW") {
        isWindowOnSelected = paper_children[childIndex].props.nearestWallKey === foundObject;
      }

      if ((objKey === foundObject) || isWindowOnSelected) {
        switch (objType) {
          case "WINDOW":
            delete windows[objKey];
            break;
          case "WALL":
            delete walls[objKey];
            Object.keys(wallWindows[objKey]).forEach(key=>{
              delete windows[key];
            });
            delete wallWindows[objKey];
            break;
          case "SKYLIGHT":
            delete skylights[objKey];
            break;
          case "FURNITURE":
            delete furnitures[objKey];
            break;
          default:
            break;
        }
        continue;
      }
      newPaperChildren.push(paper_children[childIndex]);
    }
    this.props.updateState({paper_children: newPaperChildren, foundObject: this.pickElement(), walls: walls, windows: windows, furnitures: furnitures, wallWindows: wallWindows, sketchChanged: true});
  }

  // return a new paper_children array with added path
  onDragHelper(pathStr, isDragFirst = false, isDragEnd = false) {
    const {mouseX, mouseY, draw_mode, paper_children} = this.props.state;
    const isValidPosition = this.isValidLine(mouseX, mouseY);
    const attr = {
      'stroke': isValidPosition
        ? (
          draw_mode === "WALL"
          ? 'black'
          : '#4ebce8')
        : '#e84e4e',
      'opacity': 1,
      'stroke-width': (draw_mode === "WALL" || (draw_mode === "WINDOW" && isDragEnd))
        ? (this.props.stroke_width ? this.props.stroke_width : 2)
        : (this.props.stroke_width_selected ? this.props.stroke_width_selected : 10)
    }

    const key = draw_mode+ "_" + paper_children.length + '_' + (
    new Date()).getUTCMilliseconds();

    var path = <Path d={pathStr} width={10} key={key} objType={draw_mode} attr={attr} toBack={draw_mode==="WALL"}/>

    if (!isDragFirst) {
      paper_children.pop();
    }

    if (isDragEnd && !isValidPosition) {
      return paper_children
    }


    if (draw_mode === "WINDOW" && isDragEnd) {
      path = this.getNearestWall(path);
    }

    if (path != null) {
      paper_children.push(path);
			if(isDragEnd) this.props.updateState({sketchChanged: true});
    }

    return paper_children;
  }

  // add initial path to paper_children
  onDragStart() {
    const {mouseX, mouseY, draw_mode} = this.props.state;
    if (draw_mode === "WALL" || draw_mode === "WINDOW") {
      const pathStr = util.createPathStr(mouseX, mouseY, mouseX, mouseY);
      const paper_children = this.onDragHelper(pathStr, true, false);
      this.props.updateState({
        drag_start: [
          mouseX, mouseY
        ],
        paper_children: paper_children
        // paper: this.createPaper(paper_children)
      });
    } else if(draw_mode === "ORIENTATION") {
      const angle = util.getAngle(this.props.width/2, this.props.height/2, mouseX, mouseY, this.props.radius);
      this.props.updateState({offsetNorth: angle});
    } else if(draw_mode === "FURNITURE") {
      const {selectedFurnitureKey, mouseX, mouseY} = this.props.state;
      const clickLocation = this.checkFurnitureClickLocation(mouseX, mouseY);
      if(clickLocation==="none" && selectedFurnitureKey) {
        this.deselect();
      } else if(!selectedFurnitureKey) {
        this.select(mouseX, mouseY);
      }
      this.props.updateState({furnitureTransform: clickLocation});
    }
  }

  // remove recently added path and replace with new one ending at cursor pos
  onDragMove(dx, dy, x, y, event) {
    const {mouseX, mouseY, drag_start, draw_mode} = this.props.state;
    if (draw_mode === "WALL" || draw_mode === "WINDOW") {
      const pathStr = util.createPathStr(drag_start[0], drag_start[1], mouseX, mouseY);
      const paper_children = this.onDragHelper(pathStr, false, false);
      this.props.updateState({paper_children: paper_children});
    } else if(draw_mode === "ORIENTATION") {
      const angle = util.getAngle(this.props.width/2, this.props.height/2, mouseX, mouseY, this.props.radius);
      this.props.updateState({offsetNorth: angle, sketchChanged: true});
    } else if(draw_mode === "FURNITURE") {
      const withinBounds = util.pointInCircle(this.props.width/2, this.props.height/2, this.props.radius, mouseX, mouseY);

      const {selectedFurnitureKey, activeFurniture} = this.props.state;
      if(!selectedFurnitureKey) return;

      const paper_children = this.elementsWithoutKey(selectedFurnitureKey);
      const active = activeFurniture[selectedFurnitureKey];

      if(this.props.state.furnitureTransform==="translate" && withinBounds) {
        const changeX = mouseX-active.centerX;
        const changeY = mouseY-active.centerY;

        active.centerX+=changeX;
        active.centerY+=changeY;
        active.scaleXX+=changeX;
        active.scaleXY+=changeY;
        active.scaleYX+=changeX;
        active.scaleYY+=changeY;
        active.rotationX+=changeX;
        active.rotationY+=changeY;
      } else {
        const newRightPre = util.rotateAboutPoint(active.centerX, active.centerY, active.scaleXX, active.scaleXY, -1*active.angle);

        const newBottomPre = util.rotateAboutPoint(active.centerX, active.centerY, active.scaleYX, active.scaleYY, -1*active.angle);

        const newDiagonalPre = util.rotateAboutPoint(active.centerX, active.centerY, active.rotationX, active.rotationY, -1*active.angle);

        const localPre = util.rotateAboutPoint(active.centerX, active.centerY, mouseX,mouseY, -1*active.angle)

        if(this.props.state.furnitureTransform==="scaleX" && withinBounds) {
          const distance = Math.sqrt(Math.pow(mouseX-active.centerX, 2) + Math.pow(mouseY-active.centerY, 2));
          const dir = Math.sign(localPre.x - active.centerX);
          active.width = distance;
          newRightPre.x = active.centerX + dir*active.width;
          newDiagonalPre.x = active.centerX + active.width;
          newDiagonalPre.y = active.centerY - active.height;

          const newRight = util.rotateAboutPoint(active.centerX, active.centerY, newRightPre.x, newRightPre.y, active.angle);

          const newDiagonal = util.rotateAboutPoint(active.centerX, active.centerY, newDiagonalPre.x, newDiagonalPre.y, active.angle);

          active.scaleXX = newRight.x;
          active.scaleXY = newRight.y;
          active.rotationX = newDiagonal.x;
          active.rotationY = newDiagonal.y;
        } else if(this.props.state.furnitureTransform==="scaleY" && withinBounds) {
          const distance = Math.sqrt(Math.pow(mouseX-active.centerX, 2) + Math.pow(mouseY-active.centerY, 2));
          active.height = distance;
          const dir = Math.sign(localPre.y - active.centerY);

          newBottomPre.y = active.centerY + dir*active.height;
          newDiagonalPre.x = active.centerX + active.width;
          newDiagonalPre.y = active.centerY - active.height;

          const newBottom = util.rotateAboutPoint(active.centerX, active.centerY, newBottomPre.x, newBottomPre.y, active.angle);

          const newDiagonal = util.rotateAboutPoint(active.centerX, active.centerY, newDiagonalPre.x, newDiagonalPre.y, active.angle);

          active.scaleYX = newBottom.x;
          active.scaleYY = newBottom.y;
          active.rotationX = newDiagonal.x;
          active.rotationY = newDiagonal.y;
        } else if(this.props.state.furnitureTransform==="rotate" && withinBounds) {
          const offsetRad = Math.atan((active.height)/(active.width));
          const offsetAngle = offsetRad*180/Math.PI;

          const angle = util.getAngle(active.centerX, active.centerY, mouseX, mouseY, active.height) - (90-offsetAngle);

          const newRight = util.rotateAboutPoint(active.centerX, active.centerY, newRightPre.x, newRightPre.y, angle);

          const newBottom = util.rotateAboutPoint(active.centerX, active.centerY, newBottomPre.x, newBottomPre.y, angle);

          const newDiagonal = util.rotateAboutPoint(active.centerX, active.centerY, newDiagonalPre.x, newDiagonalPre.y, angle);

          active.angle = angle;
          active.scaleXX = newRight.x;
          active.scaleXY = newRight.y;
          active.scaleYX = newBottom.x;
          active.scaleYY = newBottom.y;
          active.rotationX = newDiagonal.x;
          active.rotationY = newDiagonal.y;
        }
      }

      const draggable = active.type==="SKYLIGHT" ? this.createSkylight(active) : this.createFurniture(active);
      paper_children.push(draggable);

      this.props.updateState({paper_children: paper_children, sketchChanged: true});
    }
  }


  onClickDraggable(event) {
    const {mouseX, mouseY, draw_mode} = this.props.state;
    if(draw_mode==="FURNITURE") {
      // this.deselect();
      this.select(mouseX, mouseY);
    }
  }

  // add the path to paper_children when user finishes drag
  onDragEnd() {
    const {mouseX, mouseY, drag_start, draw_mode, walls, windows, wallWindows} = this.props.state;

    if (draw_mode === "WALL" || draw_mode === "WINDOW") {
      const pathStr = util.createPathStr(drag_start[0], drag_start[1], mouseX, mouseY);
      const paper_children = this.onDragHelper(pathStr, false, true);
      if(paper_children.length===0) {
        this.props.updateState({paper_children: paper_children, windows: windows, walls: walls, wallWindows: wallWindows});
        return;
      }
      const key = paper_children[paper_children.length-1].key;

      if(draw_mode==="WALL") {
        wallWindows[key] = {}
        walls[key] = paper_children[paper_children.length-1];
      } else {
        const wallKey = paper_children[paper_children.length-1].props.nearestWallKey;
        if(wallWindows.hasOwnProperty(wallKey)) {
          wallWindows[wallKey][key]= key;
          windows[key] = paper_children[paper_children.length-1];
        }
      }

      this.props.updateState({paper_children: paper_children, windows: windows, walls: walls, wallWindows: wallWindows});
    }
  }

  // return a path object representing a window
  createWindow(pathStr, attr, key, nearestWall, nearestWallKey) {
    const {windows, wallWindows} = this.props.state;
    const window = <Path d={pathStr} attr={attr} objType={"WINDOW"} key={key} nearestWall={nearestWall} nearestWallKey={nearestWallKey}/>
    // add key for bookkeeping
    wallWindows[nearestWallKey][key] = key;
    windows[key]=window;
    this.props.updateState({windows: windows, wallWindows: wallWindows});
    // return window obj
    return window;
  }

  // return a path object representing a wall
  createWall(pathStr, attr, key) {
    const {walls, wallWindows} = this.props.state;
    const wall = <Path d={pathStr} attr={attr} objType={"WALL"} key={key} toFront={true}/>
    // add key for bookkeeping
    wallWindows[key] = {};
    walls[key] = wall;
    this.props.updateState({
      walls: walls,
      wallWindows: wallWindows
    });
    // return wall obj
    return wall;
  }

  checkFurnitureClickLocation(clickX, clickY) {

    const {draw_mode} = this.props.state;
    const {activeFurniture, selectedFurnitureKey} = this.props.state;

    if(draw_mode==="FURNITURE") {
      if(!selectedFurnitureKey) return "none";
      const f = activeFurniture[selectedFurnitureKey];

      if(util.pointInCircle(f.centerX, f.centerY, f.radius, clickX, clickY)) {
        return "translate";
      } else if(util.pointInCircle(f.scaleYX, f.scaleYY, f.radius, clickX, clickY) && f.addScaleY) {
        return "scaleY";
      } else if(util.pointInCircle(f.scaleXX, f.scaleXY, f.radius, clickX, clickY) && f.addScaleX) {
        return "scaleX";
      } else if(util.pointInCircle(f.rotationX, f.rotationY, f.radius, clickX, clickY) && f.addRotation) {
        return "rotate";
      } else {
        return "none";
      }
    } else {
      return "none";
    }
  }

  createTransforms(params) {
    const circleAttr = {
      "fill":"white",
      "fill-opacity": 1,
      "stroke": "black"
    };

    const lineAttr = {
      "stroke-dasharray": "-",
      "stroke": "black",
      "fill": "black"
    };

    // scale (skylight only) and rotate
    const scaleX = <Circle x={params.scaleXX} y={params.scaleXY} r={this.props.radius/25} key={params.key+"_scaleX"} attr={circleAttr} objType={params.type+"_CTRL"} toFront={true} hide={params.hidden}/>

    // scale (skylight only) and rotate
    const scaleY = <Circle x={params.scaleYX} y={params.scaleYY} radius={this.props.r/25} key={params.key+"_scaleY"} attr={circleAttr} objType={params.type+"_CTRL"} toFront={true} hide={params.hidden}/>;

    // translate
    const translate = <Circle x={params.centerX} y={params.centerY} r={this.props.radius/25} key={params.key+"_translate"} attr={circleAttr} objType={params.type+"_CTRL"} toFront={true} hide={params.hidden}/>;

    // scale (skylight only) and rotate
    const rotate = <Circle x={params.rotationX} y={params.rotationY} r={this.props.radius/25} key={params.key+"_rotate"} attr={circleAttr} objType={params.type+"_CTRL"} toFront={true} hide={params.hidden}/>

    const centerScaleX = <Path d={util.createPathStr(params.centerX, params.centerY, params.scaleXX, params.scaleXY)} key={params.key+"_centerScaleX"} attr={lineAttr} objType={params.type+"_CTRL"} toFront={true} hide={params.hidden}/>

    const centerScaleY = <Path d={util.createPathStr(params.centerX, params.centerY, params.scaleYX, params.scaleYY)} key={params.key+"_centerScaleY"} attr={lineAttr} objType={params.type+"_CTRL"} toFront={true} hide={params.hidden}/>

    const centerRotate = <Path d={util.createPathStr(params.centerX, params.centerY, params.rotationX, params.rotationY)} key={params.key+"_centerRotate"} attr={lineAttr} objType={params.type+"_CTRL"} toFront={true} hide={params.hidden}/>

    const translateImage = <Image src="images/translate.png" x={params.centerX-6} y={params.centerY-6} width={12} height={12} key={params.key+"_translate_image"} rotate={{deg:params.angle}} toFront={true} hide={params.hidden}/>

    const rotateImage = <Image src="images/rotate.png" x={params.rotationX-6} y={params.rotationY-6} width={12} height={12} key={params.key+"_rotate_image"} rotate={{deg:params.angle}} toFront={true} hide={params.hidden} />

    const scaleXImage = <Image src="images/scaleX.png" x={params.scaleXX-6} y={params.scaleXY-6} width={12} height={12} key={params.key+"_scalex_image"} rotate={{deg:params.angle}} toFront={true} hide={params.hidden} />

    const scaleYImage = <Image src="images/scaleY.png" x={params.scaleYX-6} y={params.scaleYY-6} width={12} height={12} key={params.key+"_scaley_image"} rotate={{deg:params.angle}} toFront={true} hide={params.hidden} />

    var transforms = [];

    if(params.addScaleX) {
      transforms.push(centerScaleX);
      transforms.push(scaleX);
      transforms.push(scaleXImage);
    }

    if(params.addScaleY) {
      transforms.push(centerScaleY);
      transforms.push(scaleY);
      transforms.push(scaleYImage);
    }

    if(params.addRotation) {
      transforms.push(centerRotate);
      transforms.push(rotate);
      transforms.push(rotateImage);
    }

    transforms = transforms.concat([translate,translateImage]);

    return transforms;
  }

  elementsWithoutKey(key) {
    const {paper_children} = this.props.state;
    const newPaperChildren = [];
    for (var childIndex in paper_children) {
      // is selected wall
      const isSelected = paper_children[childIndex].key===key;

      if (isSelected) {
        continue;
      }
      newPaperChildren.push(paper_children[childIndex]);
    }
    return newPaperChildren;
  }

  select(mouseX, mouseY) {
    const {activeFurniture, paper_children} = this.props.state;
    for(var i=0;i<paper_children.length;i++) {
      // console.log(paper_children[i]);
      if(paper_children[i].props.objType === "SKYLIGHT" ||
         paper_children[i].props.objType === "FURNITURE") {
        const active = activeFurniture[paper_children[i].key];
        const localXY = util.rotateAboutPoint(active.centerX, active.centerY, mouseX, mouseY, 360-active.angle);
        const topLeft = {x: active.centerX-active.width/2, y: active.centerY-active.height/2};
        const bottomRight = {x: active.centerX+active.width/2, y: active.centerY+active.height/2}

        if(util.insideBox(localXY, topLeft, bottomRight)) {
          active.hidden = false;
          const draggable = active.type==="SKYLIGHT" ? this.createSkylight(active) : this.createFurniture(active);
          paper_children[i] = draggable;
          this.props.updateState({paper_children: paper_children, selectedFurnitureKey: active.key});
          return;
        }
      }
    }
  }

  pickElement() {
    const {activeFurniture, skylights, windows, walls, furnitures, mouseX, mouseY, draw_mode} = this.props.state;

    if(draw_mode!=="REMOVE" && draw_mode!=="NEUTRAL") {
      return "";
    }

    const objects = [skylights, furnitures, windows, walls];
    for(var i=0;i<objects.length;i++) {

      const children = Object.keys(objects[i]);
      for(var j=0;j<children.length;j++) {
        const child = objects[i][children[j]];


        const objType = child.props.objType;
        const objKey = child.key;

        if(objType==="SKYLIGHT" || objType==="FURNITURE") {
          const active = activeFurniture[objKey];
          const localXY = util.rotateAboutPoint(active.centerX, active.centerY, mouseX, mouseY, 360-active.angle);
          const topLeft = {x: active.centerX-active.width/2, y: active.centerY-active.height/2};
          const bottomRight = {x: active.centerX+active.width/2, y: active.centerY+active.height/2}

          if(util.insideBox(localXY, topLeft, bottomRight)) {
            return objKey;
          }
        } else if(objType==="WINDOW" || objType==="WALL") {
          const line = util.extractPathPoints(child);
          const centerX = (line.startPoint[0]+line.endPoint[0])/2;
          const centerY = (line.startPoint[1]+line.endPoint[1])/2;
          var angle = (util.getAngle(centerX, centerY, line.endPoint[0], line.endPoint[1], 10));

          const localXY = util.rotateAboutPoint(centerX, centerY, mouseX, mouseY, 90-angle);

          const width = util.distancePts(line.startPoint, line.endPoint);

          const topLeft = {x: centerX-width/2, y: centerY-10/2};
          const bottomRight = {x: centerX+width/2, y: centerY+10/2}
          if(util.insideBox(localXY, topLeft, bottomRight)) {
            return objKey;
          }
        }
      }
    }

    return "";
  }

  deselect() {
    const {selectedFurnitureKey, activeFurniture, paper_children} = this.props.state;
    if(!selectedFurnitureKey) return;

    const active = activeFurniture[selectedFurnitureKey];
    active.hidden = true;

    for(var i=0;i<paper_children.length;i++) {
      if(paper_children[i].key===selectedFurnitureKey) {
        const draggable = active.type==="SKYLIGHT" ? this.createSkylight(active) : this.createFurniture(active);
        paper_children[i] = draggable;
        break;
      }
    }
    this.props.updateState({paper_children: paper_children, selectedFurnitureKey: "", draw_mode: "NEUTRAL"});
  }

  createParams(xpos, ypos, width, height, key) {
    return {
      centerX: xpos,
      centerY: ypos,
      scaleXX: xpos+width,
      scaleXY: ypos,
      scaleYX: xpos,
      scaleYY: ypos+height,
      rotationX: xpos+width,
      rotationY: ypos-height,
      radius: this.props.radius/25,
      width: width,
      height: height,
      key: key,
      angle: 0,
      hidden: false,
      addRotation: true,
      addScaleX: true,
      addScaleY: true
    };
  }

  addFurniture(type) {
    this.toggleFurnitureMode();
    const {paper_children} = this.props.state;
    const types = {
      0: "SKYLIGHT",
      1: "BED",
      2: "DESK",
      3: "CLOSET"
    }
    const xpos = this.props.width/2;
    const ypos = this.props.height/2;
    const key = types[type] + '_' + this.props.state.paper_children.length + '_' + Math.floor(Date.now() / 100) + '_' + (new Date()).getUTCMilliseconds();
    var width=0, height=0;

    // skylight
    if(type===0) {
      width = util.metersToPixels(1.0, this.props.radius);
      height = util.metersToPixels(1.0, this.props.radius);
    } else if(type===1) {
      width = util.metersToPixels(1.524, this.props.radius);
      height = util.metersToPixels(.762, this.props.radius);
    } else if(type===2) {
      width = util.metersToPixels(1.524, this.props.radius);
      height = util.metersToPixels(0.80, this.props.radius);
    } else if(type===3) {
      width = util.metersToPixels(1.524, this.props.radius);
      height = util.metersToPixels(1.5, this.props.radius);
    }

    const params = this.createParams(xpos, ypos, width, height, key);
    params.type = types[type];
    const draggable = type===0 ? this.createSkylight(params) : this.createFurniture(params);
    paper_children.push(draggable);

    this.props.updateState({
      paper_children: paper_children,
      selectedFurnitureKey: key,
			sketchChanged: true
    });
  }

  createSkylight(params) {
    const {centerX, centerY, width, height, key, angle} = params;
    const {activeFurniture, skylights} = this.props.state;
    var skylight = <Rect x={centerX-width/2} y={centerY-height/2} width={width} height={height} attr={{"fill":"white", "fill-opacity": 0.25, "stroke-width": 1}} key={key+"_main"} rotate={{"cx":(centerX),"cy": (centerY),"deg":angle}} toBack={true}/>;

    // bookkeeping
    const transformationCtrl = this.createTransforms(params);
    transformationCtrl.push(skylight);
    skylight = <Set key={key} objType={"SKYLIGHT"}>{transformationCtrl}</Set>;

    skylights[key] = skylight;
    activeFurniture[key] = params;

    this.props.updateState({
      activeFurniture: activeFurniture,
      skylight: skylights
    });
    // return skylight
    return skylight;
  }

  createFurniture(params) {
    const {centerX, centerY, width, height, key, angle, type} = params;
    const {activeFurniture, furnitures} = this.props.state;
    const types = {
      "DESK" : "images/desk.png",
      "CLOSET" : "images/closet.png",
      "BED": "images/bed.png"
    }

    var furniture = <Image src={types[type]} x={centerX-width/2} y={centerY-height/2} width={width} height={height} key={key+"_main"} rotate={{"cx":(centerX),"cy": (centerY),"deg":angle}} toFront={true}/>;

    // bookkeeping
    params.addScaleX = false;
    params.addScaleY = false;
    const transformationCtrl = this.createTransforms(params);
    transformationCtrl.unshift(furniture);
    furniture = <Set key={key} objType={"FURNITURE"}>{transformationCtrl}</Set>;
    furnitures[key] = furniture;
    activeFurniture[key] = params;

    this.props.updateState({
      activeFurniture: activeFurniture,
      furnitures: furnitures
    });
    return furniture;
  }

  createTable() {
    return (<Rect x={0} y={0}
      width={this.props.width}
      height={this.props.height}
      drag={{
        move: this.onDragMove,
        start: this.onDragStart,
        end: this.onDragEnd
      }} attr={{
        "fill" : "red",
        "fill-opacity" : 0,
        "stroke" : "red",
        "stroke-opacity": 0
      }} key="table"
      objType={"table"}
      click={this.onMouseClick}
      mousemove={this.onMouseHover}
      toFront={true}/>
    );
  }

  onMouseClick() {
    const {draw_mode, foundObject, mouseX, mouseY} = this.props.state;
    if(draw_mode==="REMOVE") {
      this.removeHoveredElement();

    } else if(draw_mode==="NEUTRAL") {
      if(foundObject) {
        const type = foundObject.split('_')[0];
        if(type!=="WALL" && type!=="WINDOW") {
          this.props.updateState({draw_mode: "FURNITURE"});
          this.select(mouseX, mouseY);
        }
      }
    }
  }

  onMouseHover() {
    this.props.updateState({foundObject: this.pickElement()});
  }

  generateTabletop() {
    this.props.updateState({table: this.createTable()});
  }

  componentDidMount() {
    // console.log(this.props.pressedButton);
    // switch (this.props.pressedButton) {
    //   case "wallBtn":
    //     this.toggleWallMode()
    //     break;
    //   default:
    //     break;
    // }
    this.generateTabletop();
    if(this.props.config) {
      this.loadSketchFile(this.props.config);
    }
  }

  toggleWallMode() {
    this.deselect();
    if(this.props.state.draw_mode!=="WALL") {
      this.props.updateState({draw_mode: "WALL"});
    } else {
      this.props.updateState({draw_mode: "NEUTRAL"});
    }
  }

  toggleFurnitureMode() {
    this.deselect();
    if(this.props.state.draw_mode!=="FURNITURE") {
      this.props.updateState({draw_mode: "FURNITURE"});
    } else {
      this.props.updateState({draw_mode: "NEUTRAL"});
    }

  }

  toggleWindowMode() {
    this.deselect();
    if(this.props.state.draw_mode!=="WINDOW") {
      this.props.updateState({draw_mode: "WINDOW"});
    } else {
      this.props.updateState({draw_mode: "NEUTRAL"});
    }
  }

  toggleOrientationMode() {
    this.deselect();
    if(this.props.state.draw_mode!=="ORIENTATION") {
      this.props.updateState({draw_mode: "ORIENTATION"});
    } else {
      this.props.updateState({draw_mode: "NEUTRAL"});
    }
  }

  toggleLocationMode() {
    this.deselect();
    if(this.props.state.draw_mode!=="LOCATION") {
      this.props.updateState({draw_mode: "LOCATION"});
    } else {
      this.props.updateState({draw_mode: "NEUTRAL"});
    }
  }

  toggleRemoveMode() {
    this.deselect();
    if(this.props.state.draw_mode!=="REMOVE") {
      this.props.updateState({draw_mode: "REMOVE"});
    } else {
      this.props.updateState({draw_mode: "NEUTRAL"});
    }
  }

  orderPaperChildren(rtype) {
    const {paper_children} = this.props.state;
    var windows = [], walls = [], skylights = [], furnitures = [];

    paper_children.forEach(child=>{
      const type = child.props.objType
      switch (type) {
        case "WALL":
          walls.push(child);
          break;
        case "WINDOW":
          windows.push(child);
          break;
        case "SKYLIGHT":
          skylights.push(child);
          break;
        case "FURNITURE":
          furnitures.push(child);
          break;
        default:
          return []
      }
    });
    if(rtype==="WALL") return walls;
    if(rtype==="WINDOW") return windows;
    if(rtype==="SKYLIGHT") return skylights;
    if(rtype==="FURNITURE") return furnitures;
  }

  generateWallFileHelper(e) {
    var log = "";
    const wPoints = util.extractPathPoints(e);

		wPoints.startPoint[0] -= 250;
		wPoints.startPoint[1] -= 250;
		wPoints.endPoint[0] -= 250;
		wPoints.endPoint[1] -= 250;

    const cornerPoints = util.getCornerPoints(wPoints.startPoint, wPoints.endPoint);

    // get the 4 corner of a a wall/window & center to table scale
    var uL = util.centerPoint(cornerPoints[0], this.props.radius, 0, 0);
    var uR = util.centerPoint(cornerPoints[1], this.props.radius, 0, 0);
    var lR = util.centerPoint(cornerPoints[2], this.props.radius, 0, 0);
    var lL = util.centerPoint(cornerPoints[3], this.props.radius, 0, 0);

    // Filter out the NaN's values ( I know it's hacky )
    if( !util.nan_pt(uL) && !util.nan_pt(uR) && !util.nan_pt(lR) && !util.nan_pt(lL) ) {

      // Write to our string
      log += (e.props.objType === "WALL" ?  "wall  " : "window  ");
      log += util.toStr(uL[0]) + "  " + util.toStr(uL[1]) + "  ";
      log += util.toStr(uR[0]) + "  " + util.toStr(uR[1]) + "  ";
      log += util.toStr(lR[0]) + "  " + util.toStr(lR[1]) + "  ";
      log += util.toStr(lL[0]) + "  " + util.toStr(lL[1]) + "  ";
      log += (e.props.objType === "WALL" ? (util.toStr(util.getHeight(8)) + "\n") : "cyan\n");
    } //if nan

    return log;
  }

  generateWallFile() {
    const {paper_children} = this.props.state;
    var log = "north " + String(this.props.state.offsetNorth*Math.PI/180) + "\n";
    log += "coordinates " +  String(this.props.state.longitude) + " " +  String(this.props.state.latidude) + "\n";
    log += "floor_material   1.000 1.000 1.000\n";
    log += "ceiling_material 1.000 1.000 1.000\n";
    log += "wall_material  1.000 1.000 1.000\n";
    log += "table 0.000000 0.000000 0.000000 0.537077\n";

    paper_children.forEach(e => {
      if(e.props.objType==="WALL") {
        log+=this.generateWallFileHelper(e);
        for (var childIndex in paper_children) {
          const child = paper_children[childIndex];
          if(child.props.objType === "WINDOW" && child.props.nearestWall === e.props.d) {
            log+=this.generateWallFileHelper(child);
          }
        }
      } else if(e.props.objType==="SKYLIGHT" || e.props.objType==="FURNITURE") {
        const {activeFurniture} = this.props.state;
        const active = activeFurniture[e.key];
        var {centerX, centerY, angle, type} = active;
        var height = active.height;
        var width = active.width;

				centerX-=250;
				centerY-=250;

        // get corner points
        var uR = util.rotateAboutPoint(centerX, centerY, centerX + width/2, centerY + height/2, angle);
        var uL = util.rotateAboutPoint(centerX, centerY, centerX - width/2, centerY + height/2, angle);
        var lR = util.rotateAboutPoint(centerX, centerY, centerX + width/2, centerY - height/2, angle);
        var lL = util.rotateAboutPoint(centerX, centerY, centerX - width/2, centerY - height/2, angle);

        uR = util.centerPoint([uR.x, uR.y], this.props.radius, 0, 0);
        uL = util.centerPoint([uL.x, uL.y], this.props.radius, 0, 0);
        lR = util.centerPoint([lR.x, lR.y], this.props.radius, 0, 0);
        lL = util.centerPoint([lL.x, lL.y], this.props.radius, 0, 0);

				// console.log(uR[0]-500,uL,lR,lL)

        // check center points are valid
        if( !util.nan_pt(uL) && !util.nan_pt(uR) && !util.nan_pt(lR) && !util.nan_pt(lL) ) {
          var data_pts = util.toStr(uL[0]) + "  " + util.toStr(uL[1]) + "  ";
          data_pts += (util.toStr(uR[0]) + "  " + util.toStr(uR[1]) + "  ");
          data_pts += (util.toStr(lR[0]) + "  " + util.toStr(lR[1]) + "  ");
          data_pts += (util.toStr(lL[0]) + "  " + util.toStr(lL[1]) + "  ");

          switch (type) {
            case 'BED':
              log += ("bed " + data_pts + "+0.0635\n");
              break;
            case 'DESK':
              log += ("desk " + data_pts + "+0.0635\n");
              break;
            case 'CLOSET':
              log += ("wardrobe " + data_pts + "+0.1524\n");
              break;
            case 'SKYLIGHT':
              log += ("skylight " + data_pts + "+0.000\n");
              break;
            default:
              return log;
          }
        }
      }
    });
		// console.log(log);
    return log;
  }

  generateSketchFile() {
    const {windows, walls, skylights, furnitures, activeFurniture, wallWindows, longitude, latidude, mapMarkerX, mapMarkerY, southLocation, northLocation, offsetNorth, modelName} = this.props.state;
    // console.log(windows, walls);
    return JSON.stringify({
      windows: windows,
      walls: walls,
      skylights: skylights,
      furnitures: furnitures,
      wallWindows: wallWindows,
      activeFurniture: activeFurniture,
      longitude: longitude,
			latidude: latidude,
			mapMarkerX: mapMarkerX,
			mapMarkerY: mapMarkerY,
			offsetNorth: offsetNorth,
			southLocation: southLocation,
			northLocation: northLocation,
			modelName: modelName
    });
  }

  save() {
    // generate Sketch file
    // generate Wall File
  }

  loadSketchFile(config) {
    // probably should verify config
    const sketch = JSON.parse(config);
    const {walls, windows, skylights, furnitures, activeFurniture, longitude, latidude, mapMarkerX, mapMarkerY, southLocation, northLocation, offsetNorth, modelName} = sketch;
    const paper_children = [];

    Object.keys(walls).forEach(key=>{
      const wall = walls[key];
      paper_children.push(this.createWall(wall.props.d, wall.props.attr, wall.key));
    });

    Object.keys(windows).forEach(key=>{
      const window = windows[key];
      paper_children.push(this.createWindow(window.props.d, window.props.attr, window.key, window.props.nearestWall, window.props.nearestWallKey));
    });

    Object.keys(furnitures).forEach(key=>{
      // console.log(activeFurniture[key]);
      activeFurniture[key].hidden = true;
      paper_children.push(this.createFurniture(activeFurniture[key]));
    });

    Object.keys(skylights).forEach(key=>{
      // console.log(activeFurniture[key]);
      activeFurniture[key].hidden = true;
      paper_children.push(this.createSkylight(activeFurniture[key]));
    });

    this.props.updateState({
      paper_children: paper_children,
      longitude: longitude,
      latidude: latidude,
      mapMarkerX: mapMarkerX,
      mapMarkerY: mapMarkerY,
      offsetNorth: offsetNorth,
      southLocation: southLocation,
      northLocation: northLocation,
			modelName: modelName
    });
  }

  render() {
    const cursor = (this.props.state.foundObject!=="") && (this.props.state.draw_mode === "REMOVE") ?  "pointer" : "default";

    const newNorth = util.rotateAboutPoint(this.props.width/2, this.props.height/2, this.props.state.northLocation.x, this.props.state.northLocation.y, this.props.state.offsetNorth);

    const newSouth = util.rotateAboutPoint(this.props.width/2, this.props.height/2, this.props.state.southLocation.x, this.props.state.southLocation.y, this.props.state.offsetNorth);

    return (<div>
      <div onMouseMove={this.onMouseMove} id="paper_container" style={{
          // border: "1px solid black",
          width: this.props.width+"px",
          height: this.props.height+"px",
          background: "inherit",
          marginLeft: "auto",
          marginRight: "auto",
        }}>

        <div style={{position: "absolute", zindex: 0}}>
        <Paper width={this.props.width} height={this.props.height}>
          {this.orderPaperChildren("WALL")}
        </Paper>
        </div>

        <div style={{position: "absolute", zindex: 0}}>
        <Paper width={this.props.width} height={this.props.height}>
          {this.orderPaperChildren("WINDOW")}

        </Paper>
        </div>

        <div style={{position: "absolute", zindex: 0}}>
        <Paper width={this.props.width} height={this.props.height} >
          {this.orderPaperChildren("FURNITURE")}
        </Paper>
        </div>

        <div style={{position: "absolute", zindex: 0}}>
        <Paper width={this.props.width} height={this.props.height} >
          {this.orderPaperChildren("SKYLIGHT")}
        </Paper>
        </div>

        <div style={{position: "absolute", zindex: 0}}>
        <Paper width={this.props.width} height={this.props.height} >
          {<Text x={newNorth.x} y={newNorth.y} text="N" attr={{"fill":"#e84e4e", "font-size": 20}} hide={this.props.state.draw_mode!=="ORIENTATION"}/>}
          {<Text x={newSouth.x} y={newSouth.y} text="S" attr={{"fill":"#4ebce8", "font-size": 20}} hide={this.props.state.draw_mode!=="ORIENTATION"}/>}
        </Paper>
        </div>

        <div style={{position: "absolute", zindex: 1, cursor: cursor}}>
        <Paper width={this.props.width} height={this.props.height}>
          {this.props.state.table}
          {<Circle x={this.props.width/2} y={this.props.width/2} r={this.props.radius} key="circle" id="circle" objType={"tabletop"} attr={{
              "fill" : false,
              "stroke-width" : 2,
              "stroke": "#ADADAD"
            }}/>}
        </Paper>
        </div>

        {<Map width={this.props.width} height={this.props.width/(3824.0/1658.0)} clickX={this.props.state.mapMarkerX} clickY={this.props.state.mapMarkerY}
        x={0}
        y={this.props.height/4}
        hide={this.props.state.draw_mode!=="LOCATION"}
        onClick={()=>{
          const location = util.calc_long_lat(this.props.state.mouseX, this.props.state.mouseY-(this.props.height/4),this.props.width,this.props.width/(3824.0/1658.0));

          this.props.updateState({
            longitude: Number(location[0]),
            latidude: Number(location[1]),
            mapMarkerX: this.props.state.mouseX,
            mapMarkerY: this.props.state.mouseY,
						sketchChanged: true
          });
        }}/>}
      </div>
			{this.props.state.modelName}
      </div>
    );
  }
}

export default Sketch;
