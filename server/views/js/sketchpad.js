//SKETCH BASED INTERFACE FOR ARCHITECTURAL DESIGN
//BY ERIC ZHANG
//contact ezhang2008@gmail.com for more in-depth help or questions

//put the sketchpad in the 'sketchpad'
var sketchpad = document.getElementById('sketchpad');
var sketchpadPaper = new Raphael(sketchpad, CANVAS_WIDTH, CANVAS_HEIGHT);

var mousedown = false;
var lastX, lastY, path, pathString;
var sumX = 0, sumY = 0;

//keeps track of the number of objects in the canvas
var lineidcount = 0, objidcount = 0, labelcount = 0, ftcount = 0;
var lastpath = [];
//controls the number of points per portion of distance
var RESAMPLE_SIZE = 24, RESAMPLE_LEN_PER_SEGMENT = 250;
var lineLength = 0, lineMin=25;
//maximum number of iterations for recursive calling
var maxStackCalls = 500;
var startPoint, endPoint;

var shiftDown = false, windowMode = false;
var clickedOn;
var northArrowClick = false;

//probably the most important arrays, contain all the info
//on strokes, rectangles, and objects
var Stroke_List = [], Rectangles = [], Object_List = [];
var freeTransformList = [];
var ndollar = new NDollarRecognizer(true);

var CANVAS_WIDTH = SKETCHP_W();
var CANVAS_HEIGHT = SKETCHP_H();

//furnituretemplates keeps track of different templates and dimensions of real world objects
var FurnitureTemplates = [];
FurnitureTemplates.push(new FurnitureTemplate('bed','twin',100,200,'blue'));
FurnitureTemplates.push(new FurnitureTemplate('bed','full',138,200, 'blue'));
FurnitureTemplates.push(new FurnitureTemplate('bed','queen',150,213, 'blue'));
FurnitureTemplates.push(new FurnitureTemplate('bed','king',200,213, 'blue'));
FurnitureTemplates.push(new FurnitureTemplate('desk','medium',85,175, 'red'));
FurnitureTemplates.push(new FurnitureTemplate('wardrobe','small',150,200, 'green'));
FurnitureTemplates.push(new FurnitureTemplate('wardrobe','large',200,300, 'green'));

/////////////////////////////////////////////////////////////////////////////////////////////////////
//OBJECT DECLARATIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

function Stroke(id, idnum, pts, resampleSize, type) {
  this.id = id;
  this.idnum = idnum;
  this.type = type;
  this.length = strokeLength(pts);
  this.points = pts;
  this.midpoint = {x:(this.points[0].x + this.points[this.points.length-1].x)/2,
            y:(this.points[0].y + this.points[this.points.length-1].y)/2};
  this.center = centroid(pts);
  this.bestFitLine = leastSquares(this.points);
  this.lengthRatio = lengthRatio(this.points, this.length);
  //whether or not it has been deleted
  this.removed = false;
  this.windows = [];
  this.scores = [];
  //when the stroke moves, the points will change
  this.originalPoints = this.points;
  //total changes to X and Y
  this.transX = 0;
  this.transY = 0;
}

function FurnitureTemplate(name, size, h, w, color) {
  this.name = name;
  this.size = size;
  this.height = h;
  this.width = w;
  this.color = color;
  this.ratio = h/w;
}

function RectangleObject(rect, score, fType, strokes, color) {
  this.rect = {cx:(rect.cx), cy:(rect.cy), h:rect.h, w:rect.w, angle:rect.angle};
  this.id = createShapeId('rect');
  this.score = score;
  //sometimes this is a furnituretemplate, sometimes it is a string.....
  this.furnType = fType;
  this.strokes = strokes;
  this.labelId = createLabelId();
  this.freeTransformId = '';
  this.color = color;
  this.userClassify = false;
  //similar to stroke, this can move, so we keep track of original
  this.originalRect = {cx:(rect.cx), cy:(rect.cy), h:rect.h, w:rect.w, angle:rect.angle};
  this.changeX = 0;
  this.changeY = 0;

  drawRect(this.rect, this.color, this.id);
  drawLabel(rect, this.furnType, this.labelId);
  Object_List.push(this.id);
  Object_List.push(this.labelId);
}

//for when i ever get around to turning this into an object
// function SketchPad(canvasId, CANVAS_WIDTH, CANVAS_HEIGHT) {
//   this.canvas = document.getElementById(canvasId);
//   this.sketchpadPaper = new Raphael(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);
//   this.canvasWidth = CANVAS_WIDTH;
//   this.canvasHeight = CANVAS_HEIGHT;
//   this.strokeList = [];
//   this.objectList = [];
//   this.rectangleList = [];

//   this.addStroke = function(points) {

//   }
// }

function SKETCHP_H()
{
  return document.getElementById('sketchpad').offsetHeight;
}

function SKETCHP_W()
{
  return document.getElementById('sketchpad').offsetWidth;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//LOADING FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//loads the sketchpad elements using data from the database
function load_sketch_sketchpad()
{
  // Froms an ajax call to the server to get data of the working model
  $.getJSON("../php/get_session_model.php",
  {}, function(e)
  {
  // Call back function once we get back the working model
  var username = e.username;
  var stat = e.stat;
  var title = e.title;
  var paths_txt = e.wallfile_text;

  //the check used is whether or not the file contents can be parsed as valid json
  if(isJson(paths_txt)) {
    IS_NEW_MODEL = 2;
    $("#container").toggle();
    $("#sketchpad").toggle();
    if (stat == "Exisiting" || stat == "New Edited")
    {
    //load the strokes in
      loadFile(paths_txt);
      document.getElementById('title_frm').title.value = title;
    }
    else if (stat == "New")
    {
      document.getElementById('title_frm').title.value = get_random_name();
      document.getElementById('dev_info').innerHTML = "New model, not saved yet";
    }
    else
    {
      // We shouldn't ever reach this
      alert("Recived from get_session_model.php: " + stat);
      window.location = "../pages/login_page.php";
    }
  }
  });
}

//parses the json file obtained from load_sketch_sketchpad
//basically goes through and creates primitves based on the json object
function loadFile(filetext) {

  var sketchObject = JSON.parse(filetext);
  var allStrokes = sketchObject.items;
  var strokeIds = [];
  for(var i=0; i<allStrokes.length; i++) {
    if(allStrokes[i].type == 'linesegment') {
      var pts = allStrokes[i].points;
      //its a straight line
      if(pts.length <= 2) {
        addStroke(pts, false);
      }
      else if(pts.length < 2) {
        console.log('ERROR: loadfile not enough points for line');
        return;
      }
      //its not a straight line
      else if(pts.length > 2) {
        addStroke(pts, false);
      }
      //for every stroke, make the windows too
      for(var j=0; j<allStrokes[i].windows.length; j++) {
        var p = [allStrokes[i].windows[j].start, allStrokes[i].windows[j].end];
        addWindow(p, true, i);
      }
    }
    else if(allStrokes[i].type == 'scribble') {
      var pts = allStrokes[i].points;
      addStroke(pts, false);
    }
    else if(allStrokes[i].type == 'bed' || allStrokes[i].type == 'wardrobe' || allStrokes[i].type == 'desk') {
      var r = {cx:allStrokes[i].x+(allStrokes[i].width/2), cy:allStrokes[i].y+(allStrokes[i].height/2),
        w:allStrokes[i].width, h:allStrokes[i].height, angle:(allStrokes[i].angle*180/Math.PI)};
      
      for(var k=0; k<allStrokes[i].strokes.length; k++) {
        addStroke(allStrokes[i].strokes[k].points);
        strokeIds.push(allStrokes[i].strokes[k].id);
      }

      Rectangles.push(new RectangleObject(r, 0, allStrokes[i].type, strokeIds.slice(0), getColorFromType(allStrokes[i].type)));
      strokeIds = [];
    }
    else{
      console.log('ERROR LOADFILE: type not recognized');
    }
  }
}

//given a furniture type, return the respective color
function getColorFromType(type) {
  if(type == 'bed')
    return 'blue';
  if(type == 'wardrobe')
    return 'green';
  if(type == 'skylight')
    return 'yellow';
  if(type == 'desk')
    return 'red';
  return 'error';
}

//given a string, try to parse it as json
//return true if it can be
function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//NORTH ARROW FUNCTIONALITY
/////////////////////////////////////////////////////////////////////////////////////////////////////

//starting position for north Arrow
var northAngle = 0, northX = (CANVAS_WIDTH/2), northY = 5, northWidth = 30, northHeight = 40;

var northArrow = sketchpadPaper.image("../images/northarrow.png", 0, 0, northWidth, northHeight)
  .attr({cursor: "move", transform: "R" + northAngle + "T" + northX + "," + northY });
northArrow.drag(arrowDragMove, arrowDragStart, arrowDragStop);

//Setting the values in the beginning
function arrowDragStart() {
  this.ox = northX;
  this.oy = northY;
  northArrowClick = true;
}

//what does the arrow do when we let go
function arrowDragStop() {
  northAngle = angleAwayFromCenter(CANVAS_WIDTH/2,CANVAS_WIDTH/2, northX+15, northY+20);
  northArrow.animate({transform: "R" + northAngle + "T" + northX + "," + northY}, 350, "<>");
  northArrowClick = false;
}

//follow the mouse
function arrowDragMove(dx, dy) {
  northX = Math.min(CANVAS_WIDTH-30, this.ox+dx);
  northY = Math.min(CANVAS_HEIGHT-40, this.oy+dy);
  northX = Math.max(0, northX);
  northY = Math.max(0, northY);
  northArrow.attr({ transform: "R" + northAngle + "T" + northX + "," + northY });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//SKETCHPAD USABILITY FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

$(sketchpad).mousedown(function (e) {
  //only start drawing a line if we aren't hovering an object or dragging the north arrow
  if(!northArrowClick && !HOVERING_OBJECT) {
    lastpath = [];
    mousedown = true;

    var x = e.offsetX, y = e.offsetY;
    lineLength = 0;

    startPoint = new Point(x,y);
    lastpath.push(new Point(x, y));

    pathString = 'M' + x + ' ' + y + 'l0 0';
    path = sketchpadPaper.path(pathString);

    lastX = x;
    lastY = y;
  }
});

$(sketchpad).mouseup(function () {
  if(northArrowClick == true || HOVERING_OBJECT == true)
    return;
  mousedown = false;
  path.remove();

  //line has a minimum length
  if(lineLength < lineMin) {
    lastpath = [];
    windowMode = false;
    return;
  }

  //turns path into a processable path based on windowmode, etc.
  var processed = findPrintedPath(lastpath, startPoint, endPoint, clickedOn,
    windowMode, shiftDown, RESAMPLE_SIZE);
  //if we didn't like the line (ex. window angle was bad), then don't do the following
  if(processed != -1) {
    //process the line (aka add it to stroke_list, etc.)
    process_line(processed, windowMode, clickedOn);
    //try to recognize it as a letter
    var result = ndollar.Recognize([processed], true, false, true);
    result.Score = parseFloat(result.Score);

    if(result.Score > 2) {
      //then replace the old recognition
      reclassify(result.Name);
    }
    //if it's a scribble, see if it's going to delete anything
    else if(Stroke_List[Stroke_List.length-1].type == 'scribble') {
      scribbleOut();
    }
    //otherwise, it's a normal stroke, attmept recognition
    else{
      //its a drawover stroke!
      if(drawover() == false) {
        var rectStrokes = [];
        //don't start recognizing right away, wait a few strokes
        //creates the list of combinations of strokes
        if(Stroke_List.length > 6) {
          rectStrokes = rectangleScore(Stroke_List);
        }
        //returns the certain rectangles that have been chosen
        rectStrokes = chooseBestRectangles(rectStrokes);

        //find out which items need to be removed, added
        var newObjs = arrayDifferenceNoDups(rectStrokes, Rectangles);
        var oldObjs = arrayDifferenceNoDups(Rectangles, rectStrokes);

        //delete them from the data structures
        deleteListObjects(sketchpadPaper, oldObjs);
        Rectangles = deleteAFromB(oldObjs, Rectangles);
        //for each new object, create it
        for(var i=0; i<newObjs.length; i++) {
          var r = rectangleFitter(newObjs[i]);
          var c = rectangleClassification(r);
          Rectangles.push(new RectangleObject(r.rect, r.score, c.name, newObjs[i].strokes, c.color));
        }
      }
    }
  }

  //reset
  lastpath = [];
  windowMode = false;
  GLOBAL_SKETCH_ALTERED = true;
});

$(sketchpad).mousemove(function (e) {
  if (!mousedown) {
    return;
  }
  if(northArrowClick || HOVERING_OBJECT) {
    return;
  }
  var x = e.offsetX, y = e.offsetY;

  lastpath.push(new Point(x,y));
  endPoint = new Point(x,y);
  lineLength += distance(new Point(lastX, lastY), new Point(x,y));

  //if we're creating a window, keep the line straight
  if(windowMode) {
    var newPathString = pointsToPath([startPoint, new Point(x, y)]);
    path.attr('path', newPathString);
    if(windowMode) {
      path.attr({"stroke": "#0EBFE9", "stroke-width": 5});
    }
    endPoint = new Point(e.offsetX, e.offsetY);
  }
  else {
    pathString += 'l' + (x - lastX) + ' ' + (y - lastY);
    path.attr('path', pathString);
  }
  lastX = x;
  lastY = y;
});

$(sketchpad).mouseleave(function () {
  //just end the stroke if we leave the canvas
  if(lastpath.length > 0 && path != null) {
    path.remove();
    lastpath = [];
  }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////
//SKETCHPAD PRIMITIVE INTERACTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//change colors when hovering a stroke
function hovering(e) {
  this.attr({stroke: '#FF0000'});
}
function hoverout(e) {
  this.animate({stroke: '#000000'});
}
//for windows, detect if we are trying to create a window
function pathMouseDown(e) {
  windowMode = true;
  clickedOn = $(this).attr("id");
}
function pathMouseUp(e) {
  windowMode = false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//MAIN FUNCTIONALITY
/////////////////////////////////////////////////////////////////////////////////////////////////////

function addStroke(points, windowM) {
  var processed = findPrintedPath(points, points[0], points[points.length-1], clickedOn,
    windowM, shiftDown, RESAMPLE_SIZE);
  process_line(processed, windowM, " ");
}

function addWindow(points, windowM, strokeId) {
  process_line(points, windowM, strokeId);
}

function save_line(pts, idnum, idname, type, clicked) {
  var resizeNum = calcResize(lineLength, RESAMPLE_SIZE, RESAMPLE_LEN_PER_SEGMENT);
  Stroke_List.push(new Stroke(idname, idnum, pts, resizeNum, type));
  if(type == 'window') {
    if(isNaN(clicked) ) {
      var id = findIndexById(Stroke_List, clicked);
      Stroke_List[id].windows.push(idnum);
    }
    else{
      Stroke_List[clicked].windows.push(idnum);
    }
    
  }
}

//identifies the line, saves it, and draws it
function process_line(pts, windowM, clicked) {
  var idname, type;
  if(windowM == true)
    type = 'window';
  else if(randomScore(pts, 5) > .075)
    type = 'scribble';
  else
    type = 'linesegment';
  idname = type + "_" + lineidcount;
  save_line(pts, lineidcount, idname, type, clicked);
  draw_line(pts, idname, type);
  lineidcount++;
}

//goes through all the other strokes, checks for distances
//if it is close enough, then delete it
function scribbleOut() {
  if(Stroke_List[Stroke_List.length-1].type != 'scribble')
    return;
  var thisStroke = Stroke_List[Stroke_List.length-1];
  for(var i=Stroke_List.length-2; i>=0; i--) {
    if(distance(thisStroke.center, Stroke_List[i].center) < 25 && Stroke_List[i].removed == false) {
      deleteProcess(Stroke_List[Stroke_List.length-1]);
      deleteProcess(Stroke_List[i]);
      return;
    }
  }
}

//checks against all other strokes, checks for distance and slope
//if they are close enough, delete the previous one
function drawover() {
  var d = distToAll(Stroke_List.length-1);
  var curr = Stroke_List[Stroke_List.length-1];
  var j = 3;
  if(Stroke_List.length < 3)
    j = Stroke_List.length;
  if(j == 1 || curr.type =='window' || windowMode)
    return false;

  for(var i=0 ; i<j-1; i++) {
    if(d[i].dist < 15  && withinDiff(d[i].slope, curr.bestFitLine.slope) < 4
      && withinDiff(d[i].length, curr.length) < 100 && Stroke_List[d[i].id].removed == false
      && Stroke_List[d[i].id].type != 'scribble') {
      deleteProcess(Stroke_List[d[i].id]);
      return true;
    }
  }
  return false;
}

//given an idnum of a stroke, return the other stroke that is closest
function strokesCenter(idnum) {
  var pts = [], centers = [], dists = [];
  for(var i=0; i<Rectangles.length; i++) {
    pts.push(combineStrokes(Rectangles[i].strokes));
  }
  for(var i=0; i<pts.length; i++) {
    centers.push(centroid(pts[i]));
  }
  for(var i=0; i<centers.length; i++) {
    dists.push({dist: distance(Stroke_List[idnum].center, centers[i]), id:i});
  }
  dists.sort(function(a,b) {return a.dist-b.dist});
  return dists[0];
}

//returns the distance to all other strokes
function distToAllRects(idnum) {
  var output = [];
  for(var i=0; i<Rectangles.length; i++) {
    output.push({id:i, dist:distance(Stroke_List[i].center, Stroke_List[idnum].center),
      length:Stroke_List[i].length, slope:Stroke_List[i].bestFitLine.slope});

  }
  output.sort(function(a,b) {return a.dist-b.dist});
  return output;
}

//reclassifies a rectangle as another furniture item
function reclassify(letter) {
  var word = "";

  var closest = strokesCenter(Stroke_List.length-1);

  if(Rectangles.length == 0)
    return;
  if(closest.dist < 100) {
    //then reclassify it
    if(letter == 'S') {
      changeType('skylight', 'yellow', Rectangles[closest.id].id);
    }
    if(letter == "B") {
      changeType('bed', 'blue', Rectangles[closest.id].id);
    }
    if(letter == 'W') {
      changeType( 'wardrobe', 'green', Rectangles[closest.id].id);
    }
    if(letter == "D") {
      changeType('desk', 'red', Rectangles[closest.id].id);
    }
    deleteProcess(Stroke_List[Stroke_List.length-1]);
  }
  else
    console.log('hi', closest.dist);
}

//returns choice1 or choice2, based on which one is closer to spt
function findCloser(sPt, choice1, choice2) {
  var d1 = distance(sPt, choice1), d2 = distance(sPt, choice2);
  if(d1 > d2)
    return choice2;
  else
    return choice1;
}

//returns c1 or c2, based on which one is closer to an end point (start or end)
function findCloser2(sPt, ePt, choice1, choice2) {
  var d1 = distance(sPt, choice1), d2 = distance(sPt, choice2),
    d3 = distance(ePt, choice1), d4 = distance(ePt, choice2);
  if(d1 > d3)
    return choice1;
  else
    return choice2;
}

//following the line of best fit and the satrt point, add and subtract to find the
//two possible end points. choose the one closer to the end point created by user 
function travelLine(slope, length, start, closeTo) {
  var px = length/Math.sqrt(1+(slope*slope));
  var py = (slope*length)/Math.sqrt(1+(slope*slope));

  var p1 = new Point(start.x+px, start.y+py);
  var p2 = new Point(start.x-px, start.y-py);
  
  return findCloser(closeTo, p1, p2);
}

//basically window snapping logic
function findEndPoint(startPt, endPt, strokeId, length) {
  var index = findIndexById(Stroke_List, strokeId);
  var wallStroke = Stroke_List[index];
  var slope = wallStroke.bestFitLine.slope;
  
  var wallEnd = findCloser2(startPt, endPt, wallStroke.points[0], wallStroke.points[wallStroke.points.length-1]);
  var windEnd = travelLine(slope, length, startPt, endPt);
  var windLen = distance(startPt, endPt);
  
  var windSlope = (endPt.y - startPt.y)/(endPt.x - startPt.x);

  if(!isFinite(windSlope))
    windSlope = 999999;
  if(windSlope == 0)
    windSlope = .00001;

  var a1 = Math.atan(slope);
  var a2 = Math.atan(windSlope);

  var k = withinPercent(a1, a2);
  var j = withinDiff(a1, a2);

  //window angle is too much, don't create it
  if( k > .3 && j > .5) {
    return -1;
  }
  //window is too long
  if(distance(startPt, wallEnd) < windLen) {
    var newWindEnd = travelLine(slope, wallStroke.length/20, wallEnd, startPt);
    return newWindEnd;
  }
  else{
    return windEnd;
  }
}

//based on what type of path it is return the correct path points
function findPrintedPath(path, startPoint, endPoint, clickedOn, windowMode, shiftDown, RESAMPLE_SIZE) {
  var simplified;
  if(windowMode) {
    //console.log('window Path');
    var calcEnd = findEndPoint(startPoint, endPoint, clickedOn, distance(startPoint, endPoint));
    //console.log('window', startPoint, endPoint, calcEnd);
    if(calcEnd == -1) {
      //path.remove();
      windowMode = false;
      return -1;
    } 
    simplified = resamplePoints([startPoint, calcEnd], RESAMPLE_SIZE);
  }
  else if(shiftDown) {
    simplified = resamplePoints([startPoint, endPoint], RESAMPLE_SIZE);
  }
  else {
    if(isLine(path, 0, path.length-1)) {
      simplified = resamplePoints([path[0], path[path.length-1]], RESAMPLE_SIZE);
    }
    else {
      simplified = resamplePoints(path, RESAMPLE_SIZE);
      //simplified = lastpath;
    }
  }
  return simplified;
}

//returns true if the model contains windows
function modelHasWindows() {
  for(var i=0; i<Stroke_List.length; i++) {
    if(Stroke_List[i].type == 'window')
      return true;
  }
  return false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//VARIOUS 'GET' FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//given a strokeid, return ids of the strokes that its made of
function getStrokesFromObject(id) {
  var obj = findById(Object_List, id);
  var strokes = [];
  for(var i=0; i<obj.strokes.length; i++) {
    for(var j=0; j<obj.strokes[i].length; j++) {
      strokes.push(obj.strokes[i][j]);
    }
  }
  for(var i=0; i<strokes.length; i++) {
    strokes[i] = Stroke_List[strokes[i]].id;
  }
  return strokes;
}

//given an array of strokes return an array of all points
function getAllPoints(strokes) {
  var output = [];
  for(var i=0; i<strokes.length; i++) {
    for(var j=0; j<strokes[i].points.length; j++) {
      output.push(strokes[i].points[j]);
    }
  }
  return output;
}

//given an array of strokes return an array of all points (separated by stroke)
function getAllPointsSeparate(strokes) {
  var output = [], m = [];
  for(var i=0; i<strokes.length; i++) {
    for(var j=0; j<strokes[i].points.length; j++) {
      m.push(strokes[i].points[j]);
    }
    output.push({id: strokes[i].idnum, points:m.slice(0)});
    m = [];
  }
  return output;
}

//given array of stroke id numbers, return strokes themselves
function getStrokesById(strokeIds) {
  var output = [];
  for(var i=0; i<strokeIds.length; i++) {
    output.push(Stroke_List[strokeIds[i]]);
  }
  return output;
}

//given array of stroke id names, return strokes themselves
function findStrokesFromIds(ids) {
  var output = [];
  for(var i=0; i<ids.length; i++) {
    var st = Stroke_List[ids[i]];
    if(st != -1)
      output.push(st);
    else
      console.log("ERROR could not find stroke: findStrokes ", 'stroke_'+ids[i]);
  }
  return output;
}

//binary search but for arrays of objects with ids
function binarySearchPaperId(array, key) {
  var lo = 0,
    hi = array.length - 1,
    mid,
    element;
  while (lo <= hi) {
    mid = Math.floor((lo + hi) / 2, 10);
    element = array[mid].id;
    if (element < key) {
      lo = mid + 1;
    } else if (element > key) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return -1;
}

//given an id, iteratively go through and find the element with that id
function findById(strokeList, strokeId) {
  for(var i=0; i<strokeList.length; i++) {
    if(strokeList[i].id == strokeId) {
      return strokeList[i];  
    }  
  }   
  return -1;
}

//given an id find the idnum
function findIndexById(list, id) {
  for(var i=0; i<list.length; i++) {
    if(list[i].id == id)
      return i;
  }
  return -1;
}

//finds an object given a stroke ID
function findObjectById(idnum) {
  for(var i=0; i<Object_List.length; i++) {
    for(var j=0; j<Object_List[i].strokes.length; j++) {
      for(var k=0; k<Object_List[i].strokes[j].length; k++) {
        if(Object_List[i].strokes[j][k] == idnum) {
          return Object_List[i];
        }
      }
    }
  }
  return -1;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
//ANGLE FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//returns the angle from the center, used for north arrow
function angleAwayFromCenter(cx, cy, px, py) {
  return (Math.atan2(py - cy, px - cx) * 180 / Math.PI)+90;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//STROKE FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//given a set of points, return the slop, intercept, and r2 of that set of points
//least squares to find min distance to line
function leastSquares(pts) {
  var x = [], y = [];
  for(var i=0; i<pts.length; i++) {
    x.push(pts[i].x);
    y.push(pts[i].y);
  }
  var lr = {};
  var n = y.length;
  var sum_x = 0, sum_y = 0;
  var sum_xy = 0, sum_xx = 0;
  var sum_yy = 0;
   
  for (var i = 0; i < y.length; i++) {
    sum_x += x[i];
    sum_y += y[i];
    sum_xy += (x[i]*y[i]);
    sum_xx += (x[i]*x[i]);
    sum_yy += (y[i]*y[i]);
  }
  lr['slope'] = ((n*sum_xy) - (sum_x*sum_y)) / ((n*sum_xx) - (sum_x*sum_x));
  if(!isFinite(lr['slope']))
    lr['slope'] = 999999;
  if(lr['slope'] == 0)
    lr['slope'] = .00001;
  lr['intercept'] = (sum_y - (lr.slope * sum_x))/n;
  lr['r2'] = Math.pow( ( (n*sum_xy) - (sum_x*sum_y) ) /
    Math.sqrt(( (n*sum_xx) - (sum_x*sum_x) ) * ( (n*sum_yy) - (sum_y*sum_y) )),2);
  return lr;
}

//ratio of euclidian distance from first point to last point over the pathdistance
function lengthRatio(points, len) {
  var eucD = distance(points[0], points[points.length-1]);
  var pathD = len;
  return eucD/pathD;
}

//turns a set of points to a raphaeljs path
function pointsToPath(points) {
  var linepath = "";
  for(var i=0; i<points.length; i++) {
    if(i==0)
      linepath = linepath + "M"+points[i].x+","+points[i].y+" ";
    else
      linepath = linepath + "L"+points[i].x+","+points[i].y+ " ";
  }
  return linepath;
}

//path length, sum of distances between consecutive points
function strokeLength(pts) {
  var sum = 0;
  for(var i=0; i<pts.length-1; i++)
    sum += distance(pts[i], pts[i+1]);
  return sum;
}

//calculate the resize length based on the length of the line
function calcResize(length, resampleSize, lengPerSegement) {
  return Math.round(length/lengPerSegement)*resampleSize;
}

//combines strokes into one stroke
function combineStrokes(idnums) {
  var stroke = [];
  for(var i=0; i<idnums.length; i++) {
    var st = Stroke_List[idnums[i]].points;
    for(var j=0; j<st.length; j++) {
      stroke.push(st[j]);
    }
  }
  return stroke;
}

function isScribble(pts) {
  var corners = shortStraw(pts);
  var pL = pathLength(pts, 0, pts.length);
  var dist = distance(pts[0], pts[pts.length-1]);
}

//how 'random' a line is
function randomScore(pts, num) {
  var index = 0, forward = num;
  var randomness = 0;

  while(forward < pts.length) {
    randomness += (pathLength(pts, index, forward) - distance(pts[index], pts[forward]));
    index += num;
    forward += num;
  }
  return randomness/pathLength(pts, 0, pts.length-1);
}

function PathLength(points) // length traversed by a point path
{
  var d = 0.0;
  for (var i = 1; i < points.length; i++)
    d += distance(points[i - 1], points[i]);
  return d;
}

//resamples points to equidistant points
function resamplePoints(points, n)
{
  var I = PathLength(points) / (n - 1); // interval length
  var D = 0.0;
  var newpoints = new Array(points[0]);

  for (var i = 1; i < points.length; i++)
  {
    var d = distance(points[i - 1], points[i]);
    if ((D + d) >= I)
    {
      var qx = points[i - 1].x + ((I - D) / d) * (points[i].x - points[i - 1].x);
      var qy = points[i - 1].y + ((I - D) / d) * (points[i].y - points[i - 1].y);
      var qxp = parseFloat(qx.toFixed(3));
      var qyp = parseFloat(qy.toFixed(3));
      var q = new Point(qxp, qyp);
      newpoints[newpoints.length] = q; // append new point 'q'
      points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
      D = 0.0;
    }
    else D += d;
  }

  if (newpoints.length == n - 1) // somtimes we fall a rounding-error short of adding the last point, so add it if so
    newpoints[newpoints.length] = new Point(points[points.length - 1].x, points[points.length - 1].y);
  return newpoints;
}

//pathlength between point indicies a and b
function pathLength(pts, a, b) {
  var sum = 0;
  for(var i=a; i<b; i++)
    sum += distance(pts[i], pts[i+1]);
  return sum;
}

//determines whether a segement a to b is a line
function isLine(points, a, b) {
  var threshold = .9;
  var dist = distance(points[a], points[b]);
  var pathDist = pathLength(points, a, b);
  if(dist/pathDist > threshold)
    return true;
  return false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//RECTANGLE FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//create the next id for a shape
function createShapeId(type) {
  var id = type + '_' + objidcount;
  objidcount++;
  return id;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
//LABEL FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//create the next id for a shape
function createLabelId() {
  var id = 'label_' + labelcount;
  labelcount++;
  return id;
}

function drawLabel(rectangle, text, labelId) {
  var t;
  if(typeof text === 'object')
    t = text.name;
  else
    t = text;

  var label = sketchpadPaper.text(rectangle.cx, rectangle.cy, t);
  label.id = labelId;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//RECOGNITION FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////


//check to make sure they are all 'lines'
//aka the length of the stroke is close to start/end distance
function lineLengthCheck(strokes) {
  for(var i=0; i<strokes.length; i++) {
    if(strokes[i].lengthRatio < .9) {
      return false;
    }
  }
  return true;
}

//checks that all the line endings are close to at least 1 other end point
function lineEndingsCheck(strokes) {
  var endings = [], pairs = [], found = false;
  var maxCornerDist = 0;
  for(var x=0; x<strokes.length; x++) {
    maxCornerDist += strokes[x].length;
  }
  maxCornerDist = maxCornerDist*.1;

  for(var i=0; i<strokes.length; i++) {
    var s = Stroke_List[strokes[i]];
    endings.push({point: strokes[i].points[0], id: strokes[i]});
    endings.push({point: strokes[i].points[strokes[i].points.length-1], id: strokes[i]});
  }
  for(var i=0; i<endings.length-1; i++) {
    for(var j=i+1; j<endings.length; j++) {
      var b = distance(endings[i].point, endings[j].point);
      if(b < maxCornerDist && endings[i].id != endings[j].id) {
        pairs.push({p1:endings[i], p2:endings[j], dist: b});
        endings.splice(j,1);
        found = true;
      }
      if(found == true) {
        found = false;
        break;
      }
    }
  }
  if(pairs.length != strokes.length) {
    return [];
  }
  return pairs;
}

//check that the angles are close to right angles
function lineRightAngleCheck(strokes) {
  var s = strokes.slice(0);
  var center = centroid(strokes);
  var output = [];
  s.sort(function(a,b) {return angleAwayFromCenter(center.x, center.y, b.midpoint.x, b.midpoint.y)
    - angleAwayFromCenter(center.x, center.y, a.midpoint.x, a.midpoint.y);});
  for(var i=0; i<s.length; i++) {
    var s1 = s[i].bestFitLine.slope;
    var s2 = s[(i+1)%s.length].bestFitLine.slope;
    output.push(Math.abs(Math.atan(Math.abs(s1-s2)/(1+(s1*s2)))* 180 / Math.PI)%90);
  }
  var sum = sumArray(output);

  return Math.abs(90-sum/strokes.length);
}

function noWindows(strokes) {
  for(var i=0; i<strokes.length; i++) {
    if(strokes[i].windows.length != 0)
      return false;
    if(strokes[i].type == 'window')
      return false;
  }
  return true;
}

function k_combinations(set, k) {
  var i, j, combs, head, tailcombs;   
  if (k > set.length || k <= 0) {
    return [];
  }
  if (k == set.length) {
    return [set];
  }
  if (k == 1) {
    combs = [];
    for (i = 0; i < set.length; i++) {
      combs.push([set[i]]);
    }
    return combs;
  }
  combs = [];
  for (i = 0; i < set.length - k + 1; i++) {
    // head is a list that includes only our current element.
    head = set.slice(i, i + 1);
    // We take smaller combinations from the subsequent elements
    tailcombs = k_combinations(set.slice(i + 1), k - 1);
    // For each (k-1)-combination we join it with the current
    // and store it to the set of k-combinations.
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
}

//given a set of strokes, return the combinations of scores that meet the metrics
//along with their scores
function rectangleScore(strokes) {
  var output = [];
  var kCombs = k_combinations(strokes, 4);
  var maxAngleDiff = 25;
  var maxCornerDist = 0;

  for(var i=0; i<kCombs.length; i++) {
    for(var x=0; x<kCombs[i].length; x++) {
      maxCornerDist += kCombs[i][x].length;
    }
    maxCornerDist = maxCornerDist*.2;
    //all lines are close to lines
    var a = lineLengthCheck(kCombs[i]);
    //all line endings are close to another line ending
    var b = lineEndingsCheck(kCombs[i]);
    var bsum = 0;
    for(var j=0; j<b.length; j++)
      bsum += b[j].dist;
    //corners are 90 degree angles
    //average the line endings together - is corner
    var c = lineRightAngleCheck(kCombs[i]);
    var d = noWindows(kCombs[i]);
    //corner distances are close to equal
    if(a == true && b.length == 4 && c < maxAngleDiff && d == true) {
      var k = [];
      for(var j=0; j<kCombs[i].length; j++) {
        k.push(kCombs[i][j].idnum);
      }
      output.push({strokes:k, score: c/maxAngleDiff + bsum/maxCornerDist});
      k = [];
    }
  }
  return output;
}


//returns the furnituretemplate whose ratio matches the best
function rectangleClassification(rectangle) {
  var r = [];
  var rectRatio1 = rectangle.rect.h/rectangle.rect.w;
  var rectRatio2 = rectangle.rect.w/rectangle.rect.h;
  for(var i=0; i<FurnitureTemplates.length; i++) {
    r.push({ratio:withinPercent(rectRatio1,FurnitureTemplates[i].ratio), template:i});
    r.push({ratio:withinPercent(rectRatio2,FurnitureTemplates[i].ratio), template:i});
  }
  r.sort(function(a, b) {return a.ratio-b.ratio});
  return FurnitureTemplates[r[0].template];
}

function chooseBestRectangles(scores) {
  var best = [], chosen = [], pchosen = [];
  var chosenrect = true;
  var s = scores, i=0;
  s.sort(function(a,b) {return a.score-b.score});

  while(chosen.length < Stroke_List.length && i < s.length) {
    for(var j=0; j<s[i].strokes.length; j++) {
      var x = binarySearch(chosen, scores[i].strokes[j]);
      if(x == -1) {
        chosen.push(s[i].strokes[j]);
        chosen.sort(function(a,b) {return a-b});
      }
      else{
        chosenrect = false;
        break;
      }
    }
    if(chosenrect == false) {
      chosen = pchosen.slice(0);
    }
    else{
      best.push(s[i]);
      pchosen = chosen.slice(0);
    }
    i++;
    chosenrect = true;
  }
  return best;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//MULTIPURPOSE FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////


//the center point of all points entered
function centroid(points) {
  var sx=0, sy=0;
  for(var i=0; i<points.length; i++) {
    sx = sx+points[i].x;
    sy = sy+points[i].y;
  }
  var avgx = sx / points.length;
  var avgy = sy / points.length;
  
  return new Point(avgx, avgy);
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow((p2.x-p1.x),2) + Math.pow((p2.y-p1.y),2));
}

//returns the sum of all the elements in an array
function sumArray(a) {
  var sum = 0;
  for(var i=0; i<a.length; i++) {
    sum = sum + a[i];
  }
  return sum;
}

//Does not work with objects (obviously)
function binarySearch(array, key) {
  var lo = 0,
    hi = array.length - 1,
    mid,
    element;
  while (lo <= hi) {
    mid = Math.floor((lo + hi) / 2, 10);
    element = array[mid];
    if (element < key) {
      lo = mid + 1;
    } else if (element > key) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return -1;
}

function withinPercent(a, b) {
  return Math.min(Math.abs((Math.abs(a)-Math.abs(b)))/Math.abs(a), Math.abs((Math.abs(b)-Math.abs(a)))/Math.abs(b));
}

function withinDiff(a,b) {
  return Math.abs(Math.abs(a)-Math.abs(b));
}

//returns true if 2 arrays contain the same contents
function arraysEqual(arr1, arr2) {
  if(arr1.length !== arr2.length)
    return false;
  for(var i = arr1.length; i--;) {
    if(arr1[i] !== arr2[i])
      return false;
  }

  return true;
}

//given a stroke idnum, returns the distance to all other strokes from centers
function distToAll(idnum) {
  var output = [];
  for(var i=0; i<Stroke_List.length; i++) {
    if(i != idnum) {
      output.push({id:i, dist:distance(Stroke_List[i].center, Stroke_List[idnum].center),
        length:Stroke_List[i].length, slope:Stroke_List[i].bestFitLine.slope});
    }
  }
  output.sort(function(a,b) {return a.dist-b.dist});
  return output;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//DRAWING FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

function drawScene(rectStrokes, strokelist, rects, paperobj) {
  var rectStrokes = [];
  if(strokelist.length > 3) {
    rectStrokes = rectangleScore(strokelist);
  }
  rectStrokes = chooseBestRectangles(rectStrokes);
  deleteAllObjects(paperobj);
  rects = [];
  for(var i=0; i<rectStrokes.length; i++) {
    var r = rectangleFitter(rectStrokes[i]);
    var c = rectangleClassification(r);
    rects.push(new RectangleObject(r.rect, r.score, c, rectStrokes[i].strokes, c.color));
  }
}

//draws the line on the canvas based on the type
function draw_line(pts, idname, type) {
  var linepath = pointsToPath(pts);
  var drawn_line = sketchpadPaper.path(linepath);
  drawn_line.id = idname;
  if(type == 'window')
    drawn_line.attr({"stroke": "#0EBFE9", "stroke-width": 5});
  else {
    drawn_line.attr({"stroke": "#000000", "stroke-width": 3});
    drawn_line.mouseout(hoverout);
    drawn_line.mouseover(hovering);
    drawn_line.mousedown(pathMouseDown);
    drawn_line.mouseup(pathMouseUp);
  }
}

//draws a quad sided primitve
//also handles the hovering, context menu, and dragging.
function drawQuad(x,y,h,w,angle,color,id) {
  var rect = sketchpadPaper.rect(x, y, h, w);
  rect.rotate(angle);
  rect.attr({fill:color, "opacity": .25});
  rect.toBack();
  rect.id = id;
  rect.drag(objectDragMove, objectDragStart, objectDragStop);

  var b = rect.getBBox();

  var ftId = createFTId();
  rect.ftid = ftId;
  var ft = sketchpadPaper.freeTransform(rect, {
    boundary:{
      x:(b.width/2)+10, y:(b.height/2)+10, width:(CANVAS_WIDTH-b.width), height:(CANVAS_HEIGHT-b.height)-20,
    },
    distance:.75,
    drag: false,
    scale:false,
    rotate:false,
    draw:false,
  });
  ft.attrs.rotate = angle;
  ft.id  = ftId;
  freeTransformList.push(ft);

  $([rect.node]).contextMenu({
    menu:   'menuRect',
    onShow:   onContextMenuShow,
    onSelect: onContextMenuItemSelect
  });

  sketchSet.push(rect).style();
}

//draws a little circle at x,y, mostly for testing
function drawMarker(x,y,color) {
  var rect = sketchpadPaper.circle(x, y, 3);
  rect.attr({fill:color, "opacity": .5});
  rect.toBack();
}

//given a rectangle object, draw it
//START POINT IS CENTER
function drawRect(rect, color, id) {
  drawQuad(rect.cx-(rect.w/2), rect.cy-(rect.h/2), rect.w, rect.h, (360-rect.angle), color, id);
}

//create the next id for a shape
function createFTId() {
  var id = 'ft_' + ftcount;
  ftcount++;
  return id;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//MOVING PRIMITIVES FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

//goes through all points and adds x,y to each of them
function translatePoints(points, x, y) {
  var output = [];
  for(var i=0; i<points.length; i++) {
    output.push({x:points[i].x+x, y:points[i].y+y});
  }
  return output;
}

function moveLabel(labelId, rect, x, y, text) {
  var s = sketchpadPaper.getById(labelId);
  s.remove();
  drawLabel({cx:(rect.cx+x), cy:(rect.cy+y), h:rect.h, w:rect.w, angle:rect.angle}, text, labelId);
}

//given a stroke id, move a stroke x and y distance
function moveStroke(idnum, ft, x, y) {
  var currStroke = Stroke_List[idnum];
  var sId = currStroke.id;
  var s = sketchpadPaper.getById(sId);
  // console.log('before', currStroke.points[0]);
  s.remove();
  var transPts = translatePoints(currStroke.originalPoints, x, y);

  currStroke.points = transPts;
  currStroke.midpoint = {x:(transPts[0].x + transPts[transPts.length-1].x)/2,
            y:(transPts[0].y + transPts[transPts.length-1].y)/2};
  currStroke.center = centroid(currStroke.points);
  currStroke.bestFitLine = leastSquares(currStroke.points);
  currStroke.transX = x;
  currStroke.transY = y;

  var path = pointsToPath(transPts);

  var drawn_line = sketchpadPaper.path(path);
  drawn_line.id = currStroke.id;
  if(currStroke.type == 'window')
    drawn_line.attr({"stroke": "#0EBFE9", "stroke-width": 5});
  else {
    drawn_line.attr({"stroke": "#000000", "stroke-width": 3});
    drawn_line.mouseout(hoverout);
    drawn_line.mouseover(hovering);
    drawn_line.mousedown(pathMouseDown);
    drawn_line.mouseup(pathMouseUp);
  }

  //MOVE WINDOWS TOO
  for(var i=0; i<currStroke.windows.length; i++) {
    moveStroke(currStroke.windows[i], x, y);
  }
}

// Set up the object for dragging
function objectDragStart() {
  sumX = 0, sumY = 0;
}

//what does the arrow do when we let go
function objectDragStop() {
  var rect = findById(Rectangles, this.id);
  var ft = findById(freeTransformList, this.ftid);

  sumX = ft.attrs.translate.x;
  sumY = ft.attrs.translate.y;

  for(var i=0; i<rect.strokes.length; i++) {
    moveStroke(rect.strokes[i], ft, sumX, sumY);
  }
  moveLabel(rect.labelId, {cx:(rect.originalRect.cx), cy:(rect.originalRect.cy), h:rect.originalRect.h,
    w:rect.originalRect.w, angle:rect.originalRect.angle}, sumX, sumY, rect.furnType);

  // moveLabel(rect.labelId, rect.rect, sumX, sumY, rect.furnType);

  rect.rect.cx = rect.originalRect.cx + sumX;
  rect.rect.cy = rect.originalRect.cy + sumY;

  return;

  // rect.changeX = sumX;
  // rect.changeY = sumY;
}

//follow the mouse
function objectDragMove(dx, dy) {
  //doesn't do anything while dragging...
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
//CONTEXT MENU FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

var sketchSet = sketchpadPaper.set();

function onContextMenuShow (target, pos)
{
  var s = target.raphael;

  switch (s.type)
  {
    case 'rect':
      var w = s.getBBox().width; // get current width (size)
      $('#menuRect')
        .find('a[name="size"]').removeAttr('checked')
          .parent().removeClass('checked')
          .end()
        .end()
        .find('a[name="size"][w="' + w + '"]').attr('checked', 'checked')
          .parent().addClass('checked');
      break;
  }

  $('#menuRect, #menuCircle')
    .find('a[name="style"]').removeAttr('checked')
      .parent().removeClass('checked')
      .end()
    .end()
    .find('a[name="style"][val="' + s.class + '"]').attr('checked', 'checked')
      .parent().addClass('checked');
}

function onContextMenuItemSelect (menuitem, target, href, pos)
{
  var s = target.get(0).raphael;


  if (menuitem.attr('name') == 'type')
  {
    var val = menuitem.attr('val');

    switch (val)
    {
      case 'bed':
        changeType('bed', 'blue', HOVER_OBJ_ID);
        break;
      case 'desk':
        changeType('desk', 'red', HOVER_OBJ_ID);        
        break;
      case 'skylight':
        changeType('skylight', 'yellow', HOVER_OBJ_ID);         
        break;
      case 'wardrobe':
        changeType('wardrobe', 'green', HOVER_OBJ_ID);         
        break;
    }
  }
  else
  {
    
  }
}

//changes the type (aka reclassifies), and changes everything
function changeType(type, color, objId) {
  var obj = sketchpadPaper.getById(objId);
  var rect_obj = findById(Rectangles, objId);
  obj.attr({fill:color});
  rect_obj.color = color;
  rect_obj.furnType = type;
  rect_obj.userClassify = true;
  var labelObj = sketchpadPaper.getById(rect_obj.labelId);
  labelObj.attr({text:type})
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
//DELETING FUNCTIONS
/////////////////////////////////////////////////////////////////////////////////////////////////////

function deleteById(idname, idnum) {
  var obj = sketchpadPaper.getById(idname);
  obj.remove();
  Stroke_List[idnum].removed = true;

  for(var i=0; i<Stroke_List[idnum].windows.length; i++) {
    obj = sketchpadPaper.getById(Stroke_List[Stroke_List[idnum].windows[i]].id);
    obj.remove();
    Stroke_List[Stroke_List[idnum].windows[i]].removed = true;
  }
}

function deleteObjectById(idnum, rects) {
  for(var i=0; i<rects.length; i++) {
    for(var j=0; j<rects[i].strokes.length; j++) {
      if(rects[i].strokes[j] == idnum) {
          var obj = sketchpadPaper.getById(rects[i].id);
          obj.remove();
          var lab = sketchpadPaper.getById(rects[i].labelId);
          lab.remove();
          Rectangles.splice(findIndexById(Rectangles, rects[i].id), 1);
          return;
      }
    }
  }
}

function deleteProcess(stroke) {
  deleteById(stroke.id, stroke.idnum);
  deleteObjectById(stroke.idnum, Rectangles);
}

function deleteAllObjects(sketchpadPaper) {
  for(var i=0; i<Object_List.length; i++) {
    var o = sketchpadPaper.getById(Object_List[i]);
    o.remove();
  }
  Object_List = [];
}

function deleteListObjects(sketchpadPaper, array) {
  for(var i=0; i<array.length; i++) {
    var o = sketchpadPaper.getById(array[i].id);
    var label = sketchpadPaper.getById(array[i].labelId);
    o.remove();
    label.remove();
    Rectangles.splice(findIndexById(Rectangles, array[i].id), 1);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////
//FITTING AND SCORING FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////////

function rectangleFitter(strokes) {
  var str = getStrokesById(strokes.strokes);
  var r = bestFitRectStrokes(str);
  return r;
}

//rectangle will always be axis aligned - rotate the point (it's easier)
function rectDistance(centerx, centery, width, height, px, py) {
  var dx = Math.max(Math.abs(px - centerx) - width / 2, 0);
  var dy = Math.max(Math.abs(py - centery) - height / 2, 0);

  //it's inside
  if(dx == 0 && dy == 0) {
    return Math.min(Math.abs(py-centery-(height/2)),
            Math.abs(py-centery+(height/2)),
            Math.abs(px-centerx-(width/2)),
            Math.abs(px-centerx+(width/2)));
  }
  return Math.sqrt(dx*dx + dy*dy);
}

//rect will be rect:{cx, cy, w, h}
//test: {cx:50, cy:50, w:100, h:50}
function rectScore(points, rect) {
  var sum = 0;
  var rotated = rotateSet(points, {x:rect.cx, y:rect.cy}, rect.angle);
  for(var i=0; i<rotated.length; i++) {
    sum += rectDistance(rect.cx, rect.cy, rect.w, rect.h, rotated[i].x, rotated[i].y);
  }
  return sum;
}

//rotates a point based on an angle relative to the center
function rotatePt(pX, pY, cX, cY, angle) {
  angle = angle * Math.PI/180.0;
  return {
    x: (Math.cos(angle) * (pX-cX)) - (Math.sin(angle) * (pY-cY)) + cX,
    y: (Math.sin(angle) * (pX-cX)) + (Math.cos(angle) * (pY-cY)) + cY
  };
}
//same as rotatept, but does it for a set of points
function rotateSet(points, center, angle) {
  var p = [];
  for(var i=0; i<points.length; i++) {
    p.push(rotatePt(points[i].x, points[i].y, center.x, center.y, angle));
  }
  return p;
}

//the scoring algorithm to find a fitted rectangle
function recursiveScoring(points, rect, prevScore, inc) {
  var increment = 20, inc2 = 30;
  //score the current rect
  var output = [];
  var currScore = rectScore(points, rect);
  output.push({score: currScore, rect: rect});
  //if its not better than prev, then stop
  if(inc > 10) {
    if(currScore > prevScore)
      return {score: prevScore, rect: rect};
    else
      return {score: currScore, rect: rect};
  }

  if(currScore > prevScore && currScore < prevScore )
    return {score: prevScore, rect: rect};
  else{
    //otherwise keep going
    if(rect.angle < 180) {
      var rect1 = {cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle+increment};
      var pts1 = rotateSet(points, {x:rect.cx,y:rect.cy}, increment);
      var out1 = recursiveScoring(pts1, rect1, currScore, inc+1);
      output.push(out1);
    }
    if(rect.w < 300) {
      var rect3 = {cx:rect.cx, cy:rect.cy, w:rect.w+inc2, h:rect.h, angle:rect.angle};
      var pts3 = points;
      var out3 = recursiveScoring(pts3, rect3, currScore, inc+1);
      output.push(out3);
    }
    if(rect.h < 300) {
      var rect4 = {cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h+inc2, angle:rect.angle};
      var pts4 = points;
      var out4 = recursiveScoring(pts4, rect4, currScore, inc+1);
      output.push(out4);
    }

    output.sort(function(a,b) {return a.score-b.score});

    return output[0];
  }
}

//calculate the increment size based on the increment number
function incrementCalc(inc, type) {
  if(inc == 0)
    inc = 1;
  var angleStart = 20, whStart = 30, xyStart = 20;
  if(type == "angle") {
    return Math.ceil(angleStart/inc);
  }
  else if(type == "wh") {
    return Math.ceil(whStart/inc);
  }
  else if(type == "xy") {
    return Math.ceil(xyStart/inc);
  }
  else{
    console.log("ERROR IncrementCalc: Type unknown")
  }
}

function iterativeScoring(points, rect, prevScore, inc) {
  var aInc = incrementCalc(inc,'angle'), whInc = incrementCalc(inc,'wh'), xyInc = incrementCalc(inc,'xy');
  //score the current rect
  var output = [], results = [];
  var rects = [{cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle+aInc},
    {cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle-aInc},
    {cx:rect.cx, cy:rect.cy, w:rect.w+whInc, h:rect.h, angle:rect.angle},
    {cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h+whInc, angle:rect.angle},
    {cx:rect.cx, cy:rect.cy, w:rect.w-whInc, h:rect.h, angle:rect.angle},
    {cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h-whInc, angle:rect.angle},
    {cx:rect.cx+xyInc, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle},
    {cx:rect.cx, cy:rect.cy+xyInc, w:rect.w, h:rect.h, angle:rect.angle},
    {cx:rect.cx-xyInc, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle},
    {cx:rect.cx, cy:rect.cy-xyInc, w:rect.w, h:rect.h, angle:rect.angle}];

  var actions = ['+angle','-angle','+width','+height','-width',
    '-height','+xaxis','+yaxis','-xaxis','-yaxis'];
  for(var i=0; i<rects.length; i++) {
    results.push({rect:rects[i], score:rectScore(points, rects[i]), action:actions[i]});
  }
  results.sort(function(a,b) {return a.score-b.score});

  //there is a better one (pick the best of all options)
  if(inc > 750) {
    console.log('max stack size');
    return {rect:rect, score:prevScore};
  }
  if(results[0].score < prevScore) {
    return iterativeScoring(points, results[0].rect, results[0].score, inc+1);
  }
  else{
    return {rect:rect, score:prevScore};
  }
}

//for fixed size rectangles, if I ever get to that
function iterativeScoringFixedSize(points, rect, prevScore, inc) {
  var aInc = incrementCalc(inc,'angle'), whInc = incrementCalc(inc,'wh'), xyInc = incrementCalc(inc,'xy');
  //score the current rect
  var output = [], results = [];
  var rects = [{cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle+aInc},
    {cx:rect.cx, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle-aInc},
    {cx:rect.cx+xyInc, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle},
    {cx:rect.cx, cy:rect.cy+xyInc, w:rect.w, h:rect.h, angle:rect.angle},
    {cx:rect.cx-xyInc, cy:rect.cy, w:rect.w, h:rect.h, angle:rect.angle},
    {cx:rect.cx, cy:rect.cy-xyInc, w:rect.w, h:rect.h, angle:rect.angle}];

  var actions = ['+angle','-angle','+xaxis','+yaxis','-xaxis','-yaxis'];
  for(var i=0, j=rects.length; i<j; i++) {
    results.push({rect:rects[i], score:rectScore(points, rects[i]), action:actions[i]});
  }
  results.sort(function(a,b) {return a.score-b.score});

  //there is a better one (pick the best of all options)
  if(inc > maxStackCalls) {
    console.log('max stack size');
    return {rect:rect, score:prevScore};
  }
  if(results[0].score < prevScore) {
    return iterativeScoring(points, results[0].rect, results[0].score, inc+1);
  }
  else{
    return {rect:rect, score:prevScore};
  }
}

//given a set of strokes, return the best fit rectangle
function bestFitRectStrokes(strokes) {
  var pts = getAllPoints(strokes);
  var cent = centroid(pts);
  var firstTry = {cx:cent.x, cy:cent.y, w:10, h:10, angle:0};
  var out1 = iterativeScoring(pts, firstTry, 999999, 0);
  return out1;
}
//given a set of strokes, return the best fit rectangle, for fixed size furniture, which I never got to
function bestFixedSizeRect(object, furnitureName) {
  var furns = [], sizeScores = [], bestScore = 9999999, bestIndex = 0;
  for(var i=0; i<FurnitureTemplates.length; i++) {
    var ft = FurnitureTemplates[i];
    if(ft.name == furnitureName) {
      furns.push({cx:object.center.x, cy:object.center.y, w:ft.width, h:ft.height, angle:0})
    }
  }

  var pts = object.simplifiedPoints.slice(0, object.simplifiedPoints.length);
  for(var i=0; i<furns.length; i++) {
    sizeScores.push(iterativeScoringFixedSize(pts, furns[i], 999999, 0));
  }
  for(var i=0; i<sizeScores.length; i++) {
    if(sizeScores.score < bestScore) {
      bestIndex = i;
      bestScore = sizeScores.score;
    }
  }
  return sizeScores[bestIndex];
}

////////////////////////////////////////////////////////////////////////////////////////////
//EXPORTING PRIMITIVES
////////////////////////////////////////////////////////////////////////////////////////////

//finds the coordinates of a rectangle given a rectangle object
function rectangleCorners(rect) {
  //basically used to calculate the corners, add/subtrace x/y
  var t = [-1,-1, 1,-1, 1,1, -1,1];
  var output = [];
  for(var i=0; i<4; i++) {
    var nx = rect.cx+((rect.w/2)*t[i*2]);
    nx = parseFloat(nx.toFixed(4));
    var ny = rect.cy+((rect.h/2)*t[(i*2)+1]);
    ny = parseFloat(ny.toFixed(4));
    var z = rotatePt(nx,ny,rect.cx, rect.cy, rect.angle*-1);
    output.push(z);
  }
  return output;
}

//exports strokes to json format
function exportStrokes(id, name, owner, rects, north, scale) {
  var output = [],r = rects.slice(0);
  var str = [], pts = [], found = [];
  //coordinates from the map
  var coordinates = calc_long_lat(MAP_MARKER.attr('cx'), MAP_MARKER.attr('cy'), map);

  //save the rectangles
  for(var i=0; i<r.length; i++) {
    for(var j=0; j<r[i].strokes.length; j++) {
      str.push({id:r[i].strokes[j], rect:i});
    }
  }
  str.sort(function(a,b) {return a.id-b.id});
  for(var i=0; i<Stroke_List.length; i++) {
    if(Stroke_List[i].removed == false) {
      var x = binarySearchPaperId(str, i);
      var curr = Stroke_List[i];
      //this is a normal stroke
      if(curr.type == 'window') {}
      else if(x == -1) {
        if(withinPercent(curr.length, distance(curr.points[0], curr.points[curr.points.length-1])) < .001)
          pts = [curr.points[0], curr.points[curr.points.length-1]];
        else{
          pts = curr.points;
        }
        var w = [];
        for(var j=0; j<curr.windows.length; j++) {
          var curr_win = Stroke_List[curr.windows[j]];

          var w1 = curr_win.points[0].x;
          w1 = parseFloat(w1.toFixed(4));
          var w2 = curr_win.points[0].y;
          w2 = parseFloat(w2.toFixed(4));
          var w3 = curr_win.points[curr_win.points.length-1].x;
          w3 = parseFloat(w3.toFixed(4));
          var w4 = curr_win.points[curr_win.points.length-1].y;
          w4 = parseFloat(w4.toFixed(4));

          w.push({start: {x:w1, y:w2}, end: {x:w3, y:w4}});
        }
        output.push({type:curr.type, points:pts, windows:w});
      }

      else{
        //find if we've already added this rectangle
        var q = binarySearch(found, str[x].rect);
        if(q == -1) {
          //get the corner of the rectangles and its angle in radians
          var rectangle = r[str[x].rect];
          var rx = rectangle.rect.cx-(rectangle.rect.w/2);
          rx = parseFloat(rx.toFixed(4));
          var ry = rectangle.rect.cy-(rectangle.rect.h/2);
          ry = parseFloat(ry.toFixed(4));
          var a = (rectangle.rect.angle)*(Math.PI/180);
          a = parseFloat(a.toFixed(4));

          var cn = rectangleCorners(rectangle.rect);
          var st = getAllPointsSeparate(getStrokesById(rectangle.strokes));

          output.push({type:rectangle.furnType, x:rx, y:ry, height:rectangle.rect.h,
            width:rectangle.rect.w, angle:a, color:rectangle.furnType.color ,corners:cn , strokes:st});

          found.push(str[x].rect);
        }
      }
    }
  }
  var n = ((north+180)%360)*(Math.PI/180);
  n = parseFloat(n.toFixed(4));

  var s = {model_id:id, model_name:name, owner:owner, north:n, northloc:{x:northX, y:northY},
  location:{longitude:coordinates[0], latitutde:coordinates[1]}, scale:scale, items:output};
  return JSON.stringify(s);
}

////////////////////////////////////////////////////////////////////////////////////////////
//ARRAY DIFFERENCES
////////////////////////////////////////////////////////////////////////////////////////////


//THE FOLLOWING PROCESS ONLY WORKS FOR DIFFERENTIATING RECTANGLES
//ARRAYEQUALS, ACONTAINSB, ARRAYDIFFERENCENODUPS
function arraysEqual(a, b) {
  if (a === b)
    return true;
  if (a == null || b == null)
    return false;
  if (a.length != b.length)
    return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i])
      return false;
  }
  return true;
}

//returns true is b is in array A (same points means same obj)
function aContainsB(arr, b) {
  for(var i=0; i<arr.length; i++) {
    if(arraysEqual(arr[i].strokes, b.strokes))
      return true;
  }
  return false;
}

//returns array elements that are present in BEFORE but not AFTER\
function arrayDifferenceNoDups(before, after) {
  var result = [];
  for (var i = 0; i < before.length; i++) {
    if (!aContainsB(after, before[i])) {
      result.push(before[i]);
    }
  }
  return result;
}

function deleteAFromB(a, b) {
  var output = [];
  for(var i=0, j=b.length; i<j; i++) {
    var x = findById(a, b.id);
    if(x == -1) {
      output.push(b[i]);
    }
    else{}
  }
  return output;
}