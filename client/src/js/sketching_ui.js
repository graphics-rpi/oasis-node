'use strict';
/*********************************************************************
 * Globals For Sketching function
 **********************************************************************/
/*********************************************************************
 * Diffrent wall modes, many functions depend on the staus of SKETCH_MODE
 * WALL_ST8_MODE  Users creating walls with cursor
 * WALL_CUR_MODE  Users creating curved wall
 * WIN_ST8_MODE   Users can create windows
 * REMOVE_MODE    Removes Raphael element on element
 * COMPASS_MODE   Orientation will be decided on click on table
 **********************************************************************/
var SKETCH_MODE = "CURSOR_MODE"; // Modes described above
var SNAP_THRESH = 30; // Deg threshold, smaller hard to match
var PRIMITIVE_WIDTH = 4; // Width of primitives such as walls
var CURSOR_X = 0; // Mouse  X Location GLOBALS
var CURSOR_Y = 0; // Mouse  Y Location GLOBALS
var DRAG_START = []; // Point at which you begin drag
var DRAG_ELEMENT = null; // Element being dragged
// North arrow
var NORTH_TEXT; // Text label 'N'
var SOUTH_TEXT; // Text label 'S'
var MAP_MARKER; // Push pin icon to mark location
var paper = null; // Canvas where all elements are placed
var table = null; // Invisible element that we click on
var orientation = null; // Invisible layer so people can click outside the table
var map = null; // Map widget image at raphael elt
var map_cover = null; // Paper element that covers canvas
var new_task_count = 0; // How many active new task there are including submited
var task_form_id_array = []; // A string of form ids for all task objects for easy access
var freetransform_list = []; // List of all FreeTransform objects
var IS_NEW_MODEL = 0;
var GLOBAL_SKETCH_ALTERED = false;

$("#container").mousemove(function (e) {
  CURSOR_X = e.pageX - $(document).scrollLeft() - $('#container').offset().left;
  CURSOR_Y = e.pageY - $(document).scrollTop() - $('#container').offset().top;
});

function CANVAS_H() {
  return document.getElementById('container').offsetHeight;
}

function CANVAS_W() {
  return document.getElementById('container').offsetWidth;
  // return $('#container').outerWidth() - $('#container').offset().left;
}

function load_model() {
  // Genreates the table and bottom bar
  generate_tabletop();
  // Create compass widget
  generate_compass();
  // Create orientation/map widget
  generate_map();
  // Loads a sketch if there is one
  load_sketch_init();
}
// ==================================================================
// Function Calls Sequences / Functions that make UI elements
// ==================================================================
window.onload = function () {
  load_model();
};
// ==================================================================
// Creation of Tabletop
// ==================================================================
function generate_tabletop() {
  // DEBUG
  var canvas_x = 0,
    canvas_y = 0;
  // UI Canvas take up all the container
  // This thing isn't working~
  paper = new Raphael('container', CANVAS_W(), CANVAS_H());
  // // Drawing Tabletop circle
  var cx = CANVAS_W() / 2.0,
    cy = CANVAS_H() / 2.0,
    radius = Math.min(cx, cy) - 0.05 * Math.min(CANVAS_W(), CANVAS_H());
  // create table background color
  paper.circle(cx, cy, radius).attr({
    'fill': "white",
    'fill-opacity': 0.7,
    'stroke': "black",
    'stroke-width': 2,
    'stroke-opacity': 1
  }).data("primitive", "table-background").click(function () {
    if (SKETCH_MODE === "CURSOR_MODE") {
      hideAllHandles();
    }
  });
  // hides all handles when clicking on table
  // Create our table object that floats above
  table = paper.circle(cx, cy, radius).attr({
    'fill': "red",
    'fill-opacity': .0
  });
  table.data("primitive", "table");
  table.toBack();
  // Event handlers linked for dragging on the table
  table.drag(table_on_drag, table_start_drag, table_end_drag);
}
// ==================================================================
// Generate compass widget
// ================================================================
function generate_compass() {
  NORTH_TEXT = paper.text(0, 0, "N");
  SOUTH_TEXT = paper.text(0, 0, "S");
  NORTH_TEXT.attr({
    "fill": "red",
    "font-size": 20,
    "font-family": "Arial, Helvetica, sans-serif"
  });
  SOUTH_TEXT.attr({
    "fill": "blue",
    "font-size": 20,
    "font-family": "Arial, Helvetica, sans-serif"
  });
  moveCompass(table.attr('cx'), table.attr('cy') - 100);
  //invisible layer so users can click outside the table
  //mostly for orientation feature
  orientation = paper.rect(0, 0, CANVAS_W(), CANVAS_H()).attr({
    'fill': "blue",
    'fill-opacity': .0,
    "stroke-width": 0
  });
  orientation.data("primitive", "orientation");
  orientation.click(function () {
    if (SKETCH_MODE === "CURSOR_MODE") {
      hideAllHandles();
    }
  });
  // Event handlers for compass
  orientation.drag(orientation_on_drag, orientation_start_drag, orientation_end_drag);
  orientation.toBack();
}
// Helper function to move compass
function moveCompass(coor_x, coor_y) {
  // We do this so all the calculations are done below as int's always
  coor_x = Math.floor(coor_x);
  coor_y = Math.floor(coor_y);
  // moves north arrow based on coor_x and coor_y
  // alert("moveCompass: " + coor_x + ',' + coor_y );
  // Start point is
  var start = [table.attr('cx'), table.attr('cy')];
  // Cursor point
  var cursor = [coor_x, coor_y];
  var dirVec = convertLine2Vector(start, cursor);
  var negVec = negateVec(dirVec);
  var length = table.attr('r') + 13;
  var newloc = [start[0] + dirVec[0] * length, start[1] + dirVec[1] * length];
  var negloc = [start[0] + negVec[0] * length, start[1] + negVec[1] * length];
  NORTH_TEXT.attr({
    x: Math.round(newloc[0]),
    y: Math.round(newloc[1])
  });
  SOUTH_TEXT.attr({
    x: Math.round(negloc[0]),
    y: Math.round(negloc[1])
  });
  // console.log(toCompassRadians(getCompasAngle()));
}

function getCompasAngle() {
  // This function returns the signed angle from our compass
  // Get the direction
  var start = [table.attr('cx'), table.attr('cy')];
  var north = [NORTH_TEXT.attr('x'), NORTH_TEXT.attr('y')];
  var dirVec = convertLine2Vector(start, north);
  // Signed angle
  var x_axis = [1, 0];
  var perDot = x_axis[0] * dirVec[1] - x_axis[1] * dirVec[0];
  var res = Math.atan2(perDot, dotVec(x_axis, dirVec));
  // Convert to radians
  res = res * (180 / Math.PI);
  return res;
}
// ==================================================================
// Generate map widget
// ==================================================================
function generate_map() {
  // Orginal image dim
  var width = 3824,
    height = 1658;
  // new_h because we want to keep aspect ratio of map, we want to fit width to our canvas
  var new_h = (CANVAS_W() * height) / width;
  map_cover = paper.rect(0, 0, CANVAS_W(), CANVAS_H()).attr({
    'fill': "#eaedf1",
    'stroke-opacity': 0
  });
  map = paper.image("../images/map.png", 0, 0, CANVAS_W(), new_h);
  // Set default location in troy
  var abs_x = (300 / 1000) * map.attr('width'),
    abs_y = (140 / 434) * map.attr('height');
  // Place in troy
  MAP_MARKER = paper.circle(abs_x, abs_y, 4).attr({
    'fill': 'red'
  });
  hide_map();
  // Event handler when clicking
  map.click(function () {
    // moved our coordinate
    GLOBAL_SKETCH_ALTERED = true;
    // move the marker
    move_marker(CURSOR_X, CURSOR_Y);
    // set cursormode a little after being clicked
    setTimeout(cursorMode, 300);
  }); // click
}

function calc_long_lat(marker_abs_x, marker_abs_y, raphael_map) {
  var x = marker_abs_x,
    y = marker_abs_y,
    mx = raphael_map.attr('width'),
    my = raphael_map.attr('height');
  var unitx = mx / 36,
    unity = my / 15;
  // posative values = North
  // negative values = South
  var longitude;
  // posative values = East
  // negative values = West
  var latitude;
  if (x >= mx / 2) {
    latitude = ((x - mx / 2) / (mx / 2)) * 180;
  } else {
    latitude = ((mx / 2 - x) / (mx / 2)) * -180;
  }
  if (y >= (unity * 9)) {
    longitude = -1 * ((y - (unity * 9)) / (unity * 6)) * 60;
  } else {
    longitude = ((unity * 9 - y) / (unity * 9)) * 90;
  }
  var coordinates = [longitude.toFixed(2), latitude.toFixed(2)];
  return coordinates;
}

function estimate_time_zone(longt) {
  longt = parseInt(longt, 10);
  var temp = longt + 7.5;
  var count = -1;
  while (temp > -180) {
    count += 1;
    temp = temp - 15;
  }
  if (count === 9 || count === 17 || count === 19 || count === 22 || count === 27) count++;
  else if (count === 21) count += 2;
  // console.log("c ", count);
  return count;
}

function move_marker(abs_x, abs_y) {
  MAP_MARKER.remove();
  MAP_MARKER = paper.circle(abs_x, abs_y, 4).attr({
    'fill': 'red'
  });
}

function show_map() {
  map_cover.show();
  map_cover.toFront();
  map.show();
  map.toFront();
  MAP_MARKER.show();
  MAP_MARKER.toFront();
}

function hide_map() {
  map.hide();
  map_cover.hide();
  MAP_MARKER.hide();
}
// ==================================================================
// Handles the snapping a window to wall
// ==================================================================
function snapToWall(win) {
  // Snap nearest element to a wall
  // Walls
  var candidates = new Array();
  var win_pts = extractPathPoints(win);
  var win_dir = convertLine2Vector(win_pts[0], win_pts[1]);
  // Go through all canvas elements
  // Save the walls/paths
  paper.forEach(function (el) {
    // Are you a wall object?
    if (el.data('primitive') === 'WALL_ST8') {
      // Is smallest angle between our points this?
      var wall_pts = extractPathPoints(el);
      // Wall Direction vector
      var wall_dir = convertLine2Vector(wall_pts[0], wall_pts[1]);
      var angle = Math.min(angleBtwVec(win_dir, wall_dir), angleBtwVec(negateVec(win_dir), wall_dir)) * (180 / Math.PI);
      if (angle <= SNAP_THRESH) {
        candidates.push(el);
      }
    }
  });
  // // Go through all candidates and get the nearest
  var nearest_wall = null;
  var nearest_dist = 1000000;
  var _start = win_pts[0];
  var _end = win_pts[1];
  var _mid = [(_start[0] + _end[0]) / 2.0, (_start[1] + _end[1]) / 2.0];
  //if there are no walls, don't even try to snap bro
  if (candidates.length === 0) {
    win.remove();
    return win;
  }
  for (var i = 0; i < candidates.length; i++) {
    var el = candidates[i];
    var pts = extractPathPoints(el);
    var start = pts[0];
    var end = pts[1];
    // Calculate distance
    var dist = getDistancePtOnLineSeg(_mid, start, end);
    // Distance
    // console.log(dist);
    // We found a closer wall
    if (nearest_dist > dist) {
      nearest_dist = dist;
      nearest_wall = el;
    }
  }
  //don't snap if everything is too far away
  if (nearest_dist > 75) {
    win.remove();
    return win;
  }
  // Snap window to nearest_wall (redraw window)
  var pts_wall = extractPathPoints(nearest_wall);
  var slope_wall = getSlope(pts_wall[0], pts_wall[1]);
  if (slope_wall != 0) {
    var slope_per = -1.0 * (1.0 / slope_wall);
  } else {
    var slope_per = -1.0 * (1.0 / .001);
  }
  // Get the length of the wall
  var length = Math.sqrt(Math.pow(_end[0] - _start[0], 2) + Math.pow(_end[1] - _start[1], 2));
  var inter = line_intersection(slope_wall, pts_wall[0], slope_per, _mid);
  var dirVec = convertLine2Vector(pts_wall[0], pts_wall[1]);
  var negVec = negateVec(convertLine2Vector(pts_wall[0], pts_wall[1]));
  // Get start point
  var res_start = [inter[0] + dirVec[0] * 0.5 * length, inter[1] + dirVec[1] * 0.5 * length];
  var res_end = [inter[0] + negVec[0] * 0.5 * length, inter[1] + negVec[1] * 0.5 * length];
  win.remove();
  var fStart, fEnd;
  //if the start is past either end of wall
  if (inbetween(pts_wall[0], res_start, pts_wall[1])) {
    fStart = [res_start[0], res_start[1]];
  } else {
    fStart = pts_wall[1];
  }
  //if the end is past the either end of the wall
  if (inbetween(pts_wall[0], res_end, pts_wall[1])) {
    fEnd = [res_end[0], res_end[1]];
  } else {
    fEnd = pts_wall[0];
  }
  //    //if the window is completely off then do nothing about it
  //    if (!inbetween(pts_wall[0], res_end, pts_wall[1]) && !inbetween(pts_wall[0], res_start, pts_wall[1]) && (distance(pts_wall[0], pts_wall[1]) > distance(fStart, fEnd))) {
  //        win.remove();
  //        return win;
  //    }
  //make it so that the window cannot be so close to the edge of a wall (last 2% of a wall is always 100% wall)
  var per_away = .95;
  var shortenEx = fEnd[0] + (fStart[0] - fEnd[0]) * per_away;
  var shortenEy = fEnd[1] + (fStart[1] - fEnd[1]) * per_away;
  var shortenSx = fStart[0] + (fEnd[0] - fStart[0]) * per_away;
  var shortenSy = fStart[1] + (fEnd[1] - fStart[1]) * per_away;
  win = paper.path(["M", shortenSx, shortenSy, "L", shortenEx, shortenEy]);
  // Shrink window width to snap to wall
  win.attr({
    'stroke': 'blue',
    'stroke-width': 10
  });
  // To keep track of what you are
  win.data("primitive", "WIN_ST8");
  win.data("wall", nearest_wall);
  // Save this window to this wall winArray
  var winArray = nearest_wall.data('winArray');
  winArray.push(win);
  nearest_wall.data('winArray', winArray);
  return win;
}
// ==================================================================
// Where we bind event handlers to walls and windows
// ==================================================================
function bind_straight_win_handlers(elt, snap) {
  // Now we need to snap to the nearest wall
  // This goes first because it destorys
  if (snap) {
    elt = snapToWall(elt);
  }
  // How win look
  elt.attr({
    'stroke': 'blue',
    'stroke-width': 7
  });
  // To keep track of what you are
  elt.data("primitive", "WIN_ST8");
  elt.hover(function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      elt.attr({
        'stroke': 'red'
      });
    }
  }, function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      elt.attr({
        'stroke': 'blue'
      });
    }
  });
  elt.click(function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      // Find out what wall i am attached to
      var wall = elt.data('wall');
      // Remove myself from that walls win list
      var winArray = wall.data('winArray');
      var index = winArray.indexOf(elt);
      winArray.splice(index, 1);
      wall.data('winArray', winArray);
      // Remove self
      GLOBAL_SKETCH_ALTERED = true;
      elt.remove();
    }
  });
}

function bind_straight_wall_handlers(elt) {
  // How wall's look
  elt.attr({
    'stroke': 'black',
    'stroke-width': 5
  });
  // To keep track of what you are
  elt.data("primitive", "WALL_ST8");
  var winArray = Array();
  elt.data('winArray', winArray);
  elt.hover(function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      var winArray = elt.data('winArray');
      for (var i = 0; i < winArray.length; i++) {
        winArray[i].attr({
          'stroke': 'red'
        });
      }
      elt.attr({
        'stroke': 'red'
      });
    }
  }, function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      var winArray = elt.data('winArray');
      if (typeof winArray !== 'undefined') {
        for (var i = 0; i < winArray.length; i++) {
          winArray[i].attr({
            'stroke': 'blue'
          });
        }
      }
      elt.attr({
        'stroke': 'black'
      });
    }
  });
  elt.click(function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      GLOBAL_SKETCH_ALTERED = true;
      var winArray = elt.data('winArray');
      for (var i = 0; i < winArray.length; i++) {
        winArray[i].remove();
      }
      elt.remove();
    }
  });
}
// ==================================================================
// Event Handlers through Ribbon UI
// ==================================================================
function new_or_old_sketching(type, redirect_url) {
  var u = "";
  console.log(type, redirect_url);
  //   if ($('#sketchpad').css('display') === 'none') {
  //     u = '../php/task_remesh.php';
  //   } else {
  //     u = '../php/task_remesh_json.php';
  //   }
  //   $.ajax({
  //     type: "POST",
  //     url: u,
  //     data: {
  //       t_called: Math.floor(new Date().getTime() / 1000)
  //     },
  //     success: function(data) {
  //       // We put this here because of the delay in creating the model
  //       // We leave the user a loading indicator and only change the page when it is ready
  //       if (type === 1) {
  //         window.location = "../pages/3d_tab.php";
  //       } else if (type === 2) {
  //         bootbox.alert("3D model updated. Please verify before running simulations", function() {
  //           window.location = "../pages/3d_tab.php";
  //         });
  //       } else if (type === 3) {
  //         save_form('fb_sketch_form'); // defined in ribbon_events.js
  //         window.location = redirect_url;
  //       }
  //     },
  //     error: function() {
  //       alert('failure');
  //     }
  //   });
}
// Function gets an event_str string that tells us which button
// was pressed in the ribbon  UI
function sketching_ribbon_handler(event_str) {
  // event_str is the str name of the button pressed
  // console.log('sketching_ribbon_handler(' + event_str + ')');
  if (event_str === "button-straight-wall") {
    if (SKETCH_MODE === "WALL_ST8_MODE") {
      cursorMode();
    } else {
      setMode("WALL_ST8_MODE", event_str);
    }
  } //button-straight-wall
  if (event_str === "button-curved-wall") {
    if (SKETCH_MODE === "WALL_CUR_MODE") {
      cursorMode();
    } else {
      alert("Not implemented");
      //setMode("WALL_CUR_MODE", event_str);
    }
  } //button-curved-wall
  if (event_str === "button-straight-window") {
    if (SKETCH_MODE === "WIN_ST8_MODE") {
      cursorMode();
    } else {
      setMode("WIN_ST8_MODE", event_str);
    }
  } //button-stright-win
  if (event_str === "button-bed") {
    cursorMode();
    GLOBAL_SKETCH_ALTERED = true;
    var ft = bind_furniture_handlers(create_bed(0, 0), "BED");
    // Move to the center of canvas
    ft.attrs.translate.x = table.attr("cx") - ft.subject.attr('width') / 2.0;
    ft.attrs.translate.y = table.attr("cy") - ft.subject.attr('height') / 2.0;
    ft.apply();
  } //button-bed
  if (event_str === "button-desk") {
    cursorMode();
    GLOBAL_SKETCH_ALTERED = true;
    var ft = bind_furniture_handlers(create_desk(0, 0), "DESK");
    // Move to the center of canvas
    ft.attrs.translate.x = table.attr("cx") - ft.subject.attr('width') / 2.0;
    ft.attrs.translate.y = table.attr("cy") - ft.subject.attr('height') / 2.0;
    ft.apply();
  } //button-desk
  if (event_str === "button-closet") {
    cursorMode();
    GLOBAL_SKETCH_ALTERED = true;
    var ft = bind_furniture_handlers(create_closest(0, 0), "WARDROBE");
    // Move to the center of canvas
    ft.attrs.translate.x = table.attr("cx") - ft.subject.attr('width') / 2.0;
    ft.attrs.translate.y = table.attr("cy") - ft.subject.attr('height') / 2.0;
    ft.apply();
  } //button-closet
  if (event_str === "button-skylight") {
    cursorMode();
    GLOBAL_SKETCH_ALTERED = true;
    var ft = bind_skylight_handlers(create_skylight(0, 0), "SKYLIGHT");
    // Move to the center of canvas
    ft.attrs.translate.x = table.attr("cx") - ft.subject.attr('width') / 2.0;
    ft.attrs.translate.y = table.attr("cy") - ft.subject.attr('height') / 2.0;
    ft.apply();
  } //button-skylight
  if (event_str === "button-remove") {
    if (SKETCH_MODE === "REMOVE_MODE") {
      cursorMode();
    } else {
      setMode("REMOVE_MODE", event_str);
    }
  } //button-remove
  if (event_str === "button-change-orientation") {
    // console.log("passed through state change");
    if (SKETCH_MODE === "COMPASS_MODE") {
      cursorMode();
    } else {
      setMode("COMPASS_MODE", event_str);
    }
  } //button-changed-orientation
  if (event_str === 'button-load-new') {
    // Prepares for a new model on session varibles
    new_model();
  } //button-load-new
  if (event_str === 'button-help') {
    show_id("help");
  } //button-help
  if (event_str === 'button-help-task') {
    show_side_task("help");
  } //button-help-task
  if (event_str === 'button-bug') {
    show_id("bug");
  } //button-help
  if (event_str === 'button-bug-task') {
    show_side_task("bug");
  } //button-help
  if (event_str === 'button-change-coordinates') {
    // console.log("passed through state change");
    if (SKETCH_MODE === "MAP_MODE") {
      cursorMode();
    } else {
      setMode("MAP_MODE", event_str);
    }
  } //button-change-coordinates
  //  if (event_str.indexOf('tab-switch-sketching') > -1) {
  if (event_str === "switch_tab_render") {
    //    var url = event_str.split(":")[1]; // url string
    // Disable the ribbon

    var url = "../pages/3d_tab.php";
    SKETCH_MODE = "CURSOR_MODE";
    //    window.ribbon1.disableRibbon();
    /* TODO: insert a check for change before we do anything */
//        console.log(did_change_happen());
    if (did_change_happen()) {
      // var wallfile = "", pathfile = "";
      // if(Stroke_List.length > 0) {
      //   wallfile = exportStrokes('id1', 'testmodel', 'testuser', Rectangles, )
      // }
      //      console.log($("#sketchpad"));

      if ($('#sketchpad').css('display') === 'none') {
        //        console.log("dont render");
        //        console.log(generate_path_file());
        //        console.log("==================");
        //        $.ajax({
        //          type: "POST",
        //          url: "../php/save_model_session.php",
        //          data: {
        //            title: document.getElementById('title_frm').title.value,
        //            wallfile_txt: generate_wall_file(true),
        //            paths_txt: generate_path_file()
        //          },
        //          async: false,
        //          success: function() {
        //            //alert("Sucessful but not right");
        //            // Call to update the model and redirect when done;
        //            update_3d_model(url);
        //          },
        //          error: function() {
        //            alert('fail 1');
        //          }
        //        });
      } else {
        if (hasWindows()) {
          //          console.log()
          //          console.log(generate_path_file());
          //          console.log("==================");
          //          console.log();
          var title = document.getElementById('title_frm').title.value;
          var wallfile_txt = generate_wall_file(true);
          //          var paths_txt = generate_path_file();
          task_remesh_json(title, wallfile_txt);
          GLOBAL_SKETCH_ALTERED = false;
        } else {
          console.log("don't render");
        }
        

        //        alert(document.getElementById('title_frm'));
        //        $.ajax({
        //          type: "POST",
        //          url: "../php/save_model_session.php",
        //          data: {
        //            title: document.getElementById('title_frm').title.value,
        //            wallfile_txt: exportStrokes('123', 'testing1', 'ericz', Rectangles, northAngle, 106.4),
        //            paths_txt: ' '
        //          },
        //          async: false,
        //          success: function(data) {
        //            // Call to update the model and redirect when done;
        //            update_3d_model(url);
        //          },
        //          error: function() {
        //            alert('failure');
        //          }
        //        });
      }
    } else {
      // no change to the model or feedback done here
      // do we need to run remesher to setup correct view path?
      if (url === "../pages/3d_tab.php" && hasWindows()) {
        //        busy_ajax("Generating 3D Model");
        console.log("Generating 3D Model");
        //        new_or_old_sketching(1, '');
      } else {
        if (url === "../pages/3d_tab.php") {
          console.log("windows are requireed to run simulations");
          //          bootbox.alert("Windows are required to run simulations", function () {
          //            window.location = window.location;
          //          });
        } else {
          // change window location
          //          window.location = url;
          console.log("change window location");
        }
      }
    }
  } //tab-switch-sketching (save)
  if (event_str === 'button-daylight-task') {
    // Checking if we have a file stored in our slow folder
    window.ribbon1.disableRibbon();
    //    $.ajax({
    //      url: "../php/check_slow_folder.php",
    //      dataType: 'json',
    //      data: {},
    //      success: function(e) {
    //        // alert(e.stat);
    //        // Callback function after checking if there is output for us in the slow folder
    //        var stat = e.stat; // "true" or "false"
    //        if (stat === "ready") {
    //          window.ribbon1.enableRibbon();
    //          generate_new_task();
    //        } else if (stat === "update") {
    //          window.ribbon1.disableRibbon();
    //          // Call function once model is saved
    //          busy_ajax("Generating Updated 3D Model, Please Verify Before Running Simulations");
    //          new_or_old_sketching(2, '');
    //          // mindy
    //          // alert("Create an updated 3D generated model before starting a simulation task");
    //        } else if (stat === "error") {
    //          bootbox.alert("Error in Generating 3D model, Please try another sketch", function() {
    //            window.location = "../pages/3d_tab.php";
    //          });
    //        } else {
    //          alert("Bug: Unreconized Status: " + stat);
    //        }
    //      }
    //    });
  } //button-daylight-task
  if (event_str === 'button-solstice') {
    // Checking if we have a file stored in our slow folder
    window.ribbon1.disableRibbon();
    $.ajax({
      url: "../php/check_slow_folder.php",
      dataType: 'json',
      async: false,
      data: {},
      success: function (e) {
        // alert(e.stat);
        // Callback function after checking if there is output for us in the slow folder
        var stat = e.stat; // "true" or "false"
        if (stat === "ready") {
          window.ribbon1.enableRibbon();
          // Tell the server to save this model
          $.post("../php/task_daylight.php", {
            month: 12,
            day: 21,
            hour: 12,
            minute: 0,
            tz_sign: -1,
            tz_hr: 5,
            tz_min: 0,
            weather: "CLEAR",
            t_called: Math.floor(new Date().getTime() / 1000)
          }, function () {
            sketching_ribbon_handler('button-daylight-refresh');
          });
          // Tell the server to save this model
          $.post("../php/task_daylight.php", {
            month: 6,
            day: 20,
            hour: 12,
            minute: 0,
            tz_sign: -1,
            tz_hr: 5,
            tz_min: 0,
            weather: "CLEAR",
            t_called: Math.floor(new Date().getTime() / 1000)
          }, function () {
            sketching_ribbon_handler('button-daylight-refresh');
          });
        } else if (stat === "update") {
          window.ribbon1.disableRibbon();
          // Call function once model is saved
          busy_ajax("Generating Updated 3D Model, Please Verify Before Running Simulations");
          new_or_old_sketching(2, '');
          // mindy
          // alert("Create an updated 3D generated model before starting a simulation task");
        } else if (stat === "error") {
          bootbox.alert("Error in Generating 3D model, Please try another sketch", function () {
            window.location = "../pages/3d_tab.php";
          });
        } else {
          alert("Bug: Unreconized Status: " + stat);
        }
      }
    });
  }
  if (event_str === 'button-monthly') {
    // Checking if we have a file stored in our slow folder
    window.ribbon1.disableRibbon();
    //    $.ajax({
    //      url: "../php/check_slow_folder.php",
    //      dataType: 'json',
    //      async: false,
    //      data: {},
    //      success: function(e) {
    //        // alert(e.stat);
    //        // Callback function after checking if there is output for us in the slow folder
    //        var stat = e.stat; // "true" or "false"
    //        if (stat === "ready") {
    //          window.ribbon1.enableRibbon();
    //          // Tell the server to save this model
    //          for (var mm = 1; mm < 13; mm++) {
    //            $.ajax({
    //              type: 'POST',
    //              url: "../php/task_daylight.php",
    //              data: {
    //                month: mm,
    //                day: 1,
    //                hour: 12,
    //                minute: 0,
    //                tz_sign: -1,
    //                tz_hr: 5,
    //                tz_min: 0,
    //                weather: "CLEAR",
    //                t_called: Math.floor(new Date().getTime() / 1000)
    //              },
    //              async: false,
    //              success: function() {
    //                sketching_ribbon_handler('button-daylight-refresh');
    //              }
    //            });
    //          }
    //        } else if (stat === "update") {
    //          window.ribbon1.disableRibbon();
    //          // Call function once model is saved
    //          busy_ajax("Generating Updated 3D Model, Please Verify Before Running Simulations");
    //          new_or_old_sketching(2, '');
    //          // mindy
    //          // alert("Create an updated 3D generated model before starting a simulation task");
    //        } else if (stat === "error") {
    //          bootbox.alert("Error in Generating 3D model, Please try another sketch", function() {
    //            window.location = "../pages/3d_tab.php";
    //          });
    //        } else {
    //          alert("Bug: Unreconized Status: " + stat);
    //        }
    //      }
    //    });
  }
  if (event_str === 'tab-switch-task') {
    // This function expected to return a string.
    // 'continue' means continue to change tab
    // 'halt' means don't change tab anymore
    if (new_task_count > 0) {
      //
      if (confirm("All non-submitted tasks will be lost if you continue!") === false) {
        return "halt";
      } else {
        // console.log("making call to clear_non_submitted_task");
        //        $.ajax({
        //          type: "POST",
        //          url: "../php/clear_non_submitted_task.php",
        //          async: false,
        //          success: function() {
        //            // console.log("Cleared Task");
        //          }
        //        });
        return "continue";
      }
    } else {
      return "continue"; // user has no unsaved task
    }
  }
  if (event_str === 'button-daylight-refresh') {
    // var confirmed = true;
    // Have to ask if we have any non submitted task
    // This function returns a list of task objects
    // save_non_submitted_task("None");
    location.reload();
  }
  if (event_str === "button-3d-fcv") {
    activateTool("button-3d-fcv");
    window.ribbon1.disableRibbon();
    // Switch the false color visualization
    $.post("../php/toggle_visualization_mode.php", {}, function () {
      // Reload the page
      save_form('fb_sim_form');
      window.location = "../pages/sim_tab.php";
    });
  }
  if (event_str === "button-3d-ceiling") {
    // if (ceiling.side === THREE.DoubleSide)
    // {
    //   ceiling.side = THREE.FrontSide;
    // }
    // else
    // {
    //   ceiling.side = THREE.DoubleSide;
    // }
    viewer.toggle()
  } //if
  if (event_str === "button-save-wallfile") {
    saveTextAsFile();
  }
  if (event_str === 'button-video-tutorial') {
    show_video();
  }
}

function first_time_user_prompt() {
  bootbox.dialog({
    message: "It looks like you are new user, would you like quick tutorial?<br><br><i>You can always view the tutorial by clicking on the <b>Help Video</b> button in the upper right of OASIS.</i>",
    title: "Welcome to OASIS!",
    buttons: {
      main: {
        label: "Yes, I would like a tutorial",
        className: "btn-primary",
        callback: function () {
          show_video();
        }
      },
      danger: {
        label: "No, skip the tutorial",
        className: "btn-danger",
        callback: function () {}
      }
    }
  });
}

function show_video() {
  document.getElementById("container-parent").style.display = "none";
  document.getElementById("ribbon-div").style.display = "none";
  document.getElementById("tutorial_video").style.display = "inline";
  document.getElementById("overlay").style.display = "inline";
  document.getElementById("iframe").src = "https://www.youtube.com/embed/vC4PrGhhshw?rel=0&amp;vq=hd1080&cc_load_policy=1&autoplay=1";
}

function hide_video() {
  document.getElementById("container-parent").style.display = "inline";
  document.getElementById("ribbon-div").style.display = "inline";
  document.getElementById("tutorial_video").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("iframe").src = "";
}

function createOption(parent, text, value, selected) {
  //selected = typeof selected !=== 'undefined' ? selected : false;
  var TXT_WIDTH = 15;
  var padded_txt = text;
  for (var i = 0; i < TXT_WIDTH - text.length; i++) {
    padded_txt += "\u00a0";
  }
  var option = new Option(padded_txt, value, false, false);
  if (selected) {
    option.selected = "true";
  }
  parent.appendChild(option);
}

function deactiveAllTools() {
  //  window.ribbon1.setToolsInactive([
  //    "button-straight-wall",
  //    "button-curved-wall",
  //    "button-straight-window",
  //    "button-bed",
  //    "button-desk",
  //    "button-closet",
  //    "button-remove",
  //    "button-change-orientation",
  //    "button-change-coordinates",
  //    "button-daylight-task",
  //    "button-daylight-batch"
  //  ]);
}

function activateTool(btn_str) {
  deactiveAllTools();
  //      window.ribbon1.setToolsActive([btn_str]);
}

function cursorMode() {
  SKETCH_MODE = "CURSOR_MODE";
  deactiveAllTools();
  table.toBack();
  orientation.toBack();
  hideAllHandles();
  hide_map();
}

function hideAllHandles() {
  for (var i = 0; i < freetransform_list.length; i++) {
    freetransform_list[i].hideHandles({
      undrag: false
    });
  }
}

function setMode(MODE, button_str) {
  SKETCH_MODE = MODE;
  deactiveAllTools();
  activateTool(button_str);
  // Move event handler layers to the back
  table.toBack();
  orientation.toBack();
  // Hide all maps
  hide_map();
  // Pick which to move
  if (MODE === "WALL_ST8_MODE" || MODE === "WIN_ST8_MODE") {
    table.toFront();
  }
  if (MODE === "COMPASS_MODE") {
    orientation.toFront();
  }
  if (MODE === "REMOVE_MODE") {
    hideAllHandles();
  }
  if (MODE === "MAP_MODE") {
    show_map();
  }
}
// ===========================================================
// Furniture items
// ===========================================================
function bind_skylight_handlers(raphael_obj, ITEM_STR) {
  // Makes search for item easy
  raphael_obj.data('primitive', ITEM_STR);
  // TODO make handlers for
  var ft = paper.freeTransform(raphael_obj, {
    scale: true,
    distance: 2,
    size: 10
  }, function (ft, events) {
    // Made a change to this object
    var raphael_obj = ft.subject;
    //console.log(events);
    if (events === "drag start") {
      ft.subject.toFront();
      GLOBAL_SKETCH_ALTERED = true;
      // drag start is the same as an onclick event
      if (SKETCH_MODE === 'REMOVE_MODE') {
        // Find and remove item from an array
        var i = freetransform_list.indexOf(ft);
        if (i != -1) {
          freetransform_list.splice(i, 1);
        }
        ft.unplug();
        //GLOBAL_SKETCH_ALTERED = true;
        raphael_obj.remove();
      }
      if (SKETCH_MODE === "CURSOR_MODE") {
        // do nothing
      }
    } else if (events === "apply") {} else if (events === "drag end") {
      if (SKETCH_MODE === "CURSOR_MODE") {
        var x = (ft.attrs.x + ft.attrs.translate.x);
        var y = (ft.attrs.y + ft.attrs.translate.y);
        var w = ft.attrs.size.x * ft.attrs.scale.x;
        var h = ft.attrs.size.y * ft.attrs.scale.y;
        var a = ft.attrs.rotate;
        // Getting raphael object called el
        var el = ft.subject;
        var object_str = el.data('primitive');
        // Initate
        var uL = new Array();
        var uR = new Array();
        var lR = new Array();
        var lL = new Array();
        // get the 4 corner of a a wall/window
        uL = upperLeftCorner(x, y, w, h, a, ft);
        uR = upperRightCorner(x, y, w, h, a, ft);
        lR = lowerRightCorner(x, y, w, h, a, ft);
        lL = lowerLeftCorner(x, y, w, h, a, ft);
        // debug visualization of points =====
        // paper.circle(uL[0],uL[1],2).attr({fill: 'red'});
        // paper.circle(uR[0],uR[1],2).attr({fill: 'green'});
        // paper.circle(lL[0],lL[1],2).attr({fill: 'blue'});
        // paper.circle(lR[0],lR[1],2).attr({fill: 'white'});
        // remove debug ==================
        // are we inside the table?
        if (table.isPointInside(uL[0], uL[1]) && table.isPointInside(uR[0], uR[1]) && table.isPointInside(lR[0], lR[1]) && table.isPointInside(lL[0], lL[1])) {
          // Show this item's handles
          ft.showHandles();
          // All other items handles are hidden
          for (var i = freetransform_list.length - 1; i >= 0; i--) {
            if (freetransform_list[i] != ft) {
              freetransform_list[i].hideHandles({
                undrag: false
              });
            }
          }
        } else {
          bootbox.alert("Item out of bounds", function () {
            // We need to remove this now because it is bad!
            // Find and remove item from an array
            var i = freetransform_list.indexOf(ft);
            if (i != -1) {
              freetransform_list.splice(i, 1);
            }
            ft.unplug();
            raphael_obj.remove();
          }); // alert
        }
      } // cursormode
    } else {
      // insert more events in place of this else if need be
      // console.log("non  handled event:" + events);
    }
  });
  freetransform_list.push(ft);
  // Show hidden freeTransform handles
  ft.apply();
  raphael_obj.hover(function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      raphael_obj.attr({
        'stroke': 'red',
        'stroke-width': 5
      });
      ft.apply();
    }
  }, function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      raphael_obj.attr({
        'stroke': 'black',
        'stroke-width': 1
      });
      ft.apply();
    }
  });
  return ft;
}

function bind_furniture_handlers(raphael_obj, ITEM_STR) {
  // Makes search for item easy
  raphael_obj.data('primitive', ITEM_STR);
  // Add freeTransform with options and callback
  var ft = paper.freeTransform(raphael_obj, {
      keepRatio: true,
      scale: false,
      distance: 2,
      size: 10
    }, function (ft, events) {
      // Made a change to this object
      var raphael_obj = ft.subject;
      //console.log(events);
      if (events === "drag start") {
        ft.subject.toFront();
        GLOBAL_SKETCH_ALTERED = true;
        // drag start is the same as an onclick event
        if (SKETCH_MODE === 'REMOVE_MODE') {
          // Find and remove item from an array
          var i = freetransform_list.indexOf(ft);
          if (i != -1) {
            freetransform_list.splice(i, 1);
          }
          ft.unplug();
          //GLOBAL_SKETCH_ALTERED = true;
          raphael_obj.remove();
        }
        if (SKETCH_MODE === "CURSOR_MODE") {
          // do nothing
        }
      } else if (events === "apply") {} else if (events === "drag end") {
        if (SKETCH_MODE === "CURSOR_MODE") {
          var x = (ft.attrs.x + ft.attrs.translate.x);
          var y = (ft.attrs.y + ft.attrs.translate.y);
          var w = ft.attrs.size.x * ft.attrs.scale.x;
          var h = ft.attrs.size.y * ft.attrs.scale.y;
          var a = ft.attrs.rotate;
          // Getting raphael object called el
          var el = ft.subject;
          var object_str = el.data('primitive');
          if (object_str === "WARDROBE") {
            h = ft.attrs.size.y / 3.0;
          }
          // Initate
          var uL = new Array();
          var uR = new Array();
          var lR = new Array();
          var lL = new Array();
          // get the 4 corner of a a wall/window
          uL = upperLeftCorner(x, y, w, h, a, ft);
          uR = upperRightCorner(x, y, w, h, a, ft);
          lR = lowerRightCorner(x, y, w, h, a, ft);
          lL = lowerLeftCorner(x, y, w, h, a, ft);
          // debug visualization of points =====
          // paper.circle(uL[0],uL[1],2).attr({fill: 'red'});
          // paper.circle(uR[0],uR[1],2).attr({fill: 'green'});
          // paper.circle(lL[0],lL[1],2).attr({fill: 'blue'});
          // paper.circle(lR[0],lR[1],2).attr({fill: 'white'});
          // remove debug ==================
          // are we inside the table?
          if (table.isPointInside(uL[0], uL[1]) && table.isPointInside(uR[0], uR[1]) && table.isPointInside(lR[0], lR[1]) && table.isPointInside(lL[0], lL[1])) {
            // Show this item's handles
            ft.showHandles();
            // All other items handles are hidden
            for (var i = freetransform_list.length - 1; i >= 0; i--) {
              if (freetransform_list[i] != ft) {
                freetransform_list[i].hideHandles({
                  undrag: false
                });
              }
            }
          } else {
            bootbox.alert("Item out of bounds", function () {
              // We need to remove this now because it is bad!
              // Find and remove item from an array
              var i = freetransform_list.indexOf(ft);
              if (i != -1) {
                freetransform_list.splice(i, 1);
              }
              ft.unplug();
              raphael_obj.remove();
            }); // alert
          }
        } // cursormode
      } else {
        // insert more events in place of this else if need be
        // console.log("non  handled event");
      }
    } //event handler
  );
  freetransform_list.push(ft);
  // Show hidden freeTransform handles
  ft.apply();
  raphael_obj.hover(function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      // raphael_obj.attr(
      // {
      //   'stroke': 'red',
      //   'stroke-width' : 5
      // });
      //ft.attrs.scale.x = 2;
      //ft.attrs.scale.y = 2;
      var lc = ITEM_STR.toLowerCase();
      var image_string = '../images/' + lc + '-red.png';
      raphael_obj.attr('src', image_string);
      ft.apply();
    }
  }, function () {
    if (SKETCH_MODE === 'REMOVE_MODE') {
      var lc = ITEM_STR.toLowerCase();
      var image_string = '../images/' + lc + '.png';
      raphael_obj.attr('src', image_string);
      ft.apply();
    }
  });
  return ft;
}

function create_skylight(xpos, ypos) {
  // this function will create a bed raphael object
  var WINDOW_WIDTH = metersToPixels(1.0);
  var WINDOW_HEIGHT = metersToPixels(1.0);
  var rect = paper.rect(xpos, ypos, WINDOW_WIDTH, WINDOW_HEIGHT).attr('fill', 'blue');
  rect.attr({
    'fill-opacity': 0.25
  });
  return rect;
}

function create_bed(xpos, ypos) {
  // this function will create a bed raphael object
  var BED_WIDTH = metersToPixels(1.905);
  var BED_HEIGHT = metersToPixels(.9652);
  var rect = paper.image('../images/bed.jpg', xpos, ypos, BED_WIDTH, BED_HEIGHT).attr('fill', 'green');
  // var rect = paper.rect(xpos, ypos, BED_WIDTH, BED_HEIGHT)
  //   .attr('fill', 'green' );
  // rect.attr({'fill-opacity' : .8});
  return rect;
}

function create_desk(xpos, ypos) {
  // this function will create a bed raphael object
  var DESK_WIDTH = metersToPixels(1.524);
  var DESK_HEIGHT = metersToPixels(0.762);
  var rect = paper.image('../images/desk.png', xpos, ypos, DESK_WIDTH, DESK_HEIGHT).attr('fill', 'orange');
  // var rect = paper.rect(xpos,ypos, DESK_WIDTH, DESK_HEIGHT)
  //   .attr('fill', 'orange');
  // rect.attr({'fill-opacity' : .8});
  return rect;
}

function create_closest(xpos, ypos) {
  var WARDROBE_WIDTH = metersToPixels(1.2192);
  // var WARDROBE_HEIGHT =  metersToPixels(0.762); // without doors included
  var WARDROBE_HEIGHT = metersToPixels(0.762 * 3.0); // with doors
  var rect = paper.image('../images/closet.png', 0, 0, WARDROBE_WIDTH, WARDROBE_HEIGHT).attr('fill', 'brown');
  // var rect = paper.rect(0,0, WARDROBE_WIDTH, WARDROBE_HEIGHT)
  //   .attr('fill', 'brown');
  // rect.attr({'fill-opacity' : .8});
  return rect;
}
// ===========================================================
// Developer tool to save file
// ===========================================================
function saveTextAsFile() {
  var textToWrite = generate_wall_file(true); //<------------------------------------------ UNCOMMENT
  //var textToWrite = generate_path_file(); // <------------------------------------------- REMOVE
  var textFileAsBlob = new Blob([textToWrite], {
    type: 'text/plain'
  });
  var fileNameToSaveAs = "wallfile.wall";
  var downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked
    // without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
  } else {
    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }
  downloadLink.click();
}

function destroyClickedElement(event) {
  document.body.removeChild(event.target);
}
// ==================================================================
// Table event handlers
// ==================================================================
function table_start_drag() {
  table.toBack();
  if (SKETCH_MODE === "WALL_ST8_MODE") {
    // Using globals to keep track of where you started
    DRAG_START = [CURSOR_X, CURSOR_Y];
    DRAG_ELEMENT = paper.path(["M", DRAG_START[0], DRAG_START[1], "L", DRAG_START[0], DRAG_START[1]]);
  } else if (SKETCH_MODE === "WALL_CUR_MODE") {
    // Not implemented
  } else if (SKETCH_MODE === "WIN_ST8_MODE") {
    // Using globals to keep track of where you started
    DRAG_START = [CURSOR_X, CURSOR_Y];
    DRAG_ELEMENT = paper.path(["M", DRAG_START[0], DRAG_START[1], "L", DRAG_START[0], DRAG_START[1]]);
  } else if (SKETCH_MODE === "CURSOR_MODE") {} else if (SKETCH_MODE === "COMPASS_MODE") {
    // Do nothing orientation rectangle handles this
    alert("Error: Table pressed when in compass mode");
  } else {
    console.log("Error: Table Start Drag 1");
  }
}

function table_on_drag() {
  if (SKETCH_MODE === "WALL_ST8_MODE") {
    // Using the globals you used, destroy and recreate the object
    DRAG_ELEMENT.remove();
    DRAG_ELEMENT = paper.path(["M", DRAG_START[0], DRAG_START[1], "L", CURSOR_X, CURSOR_Y]);
    //        console.log(table.isPointInside(CURSOR_X, CURSOR_Y), CURSOR_X, CURSOR_Y);
    // Color the line you are making red as a warning that you are outside the table
    table.isPointInside(CURSOR_X, CURSOR_Y) ? DRAG_ELEMENT.attr({
      'stroke': 'black'
    }) : DRAG_ELEMENT.attr({
      'stroke': 'red'
    });
  } else if (SKETCH_MODE === "WALL_CUR_MODE") {} else if (SKETCH_MODE === "WIN_ST8_MODE") {
    // Using the globals you used, destroy and recreate the object
    DRAG_ELEMENT.remove();
    DRAG_ELEMENT = paper.path(["M", DRAG_START[0], DRAG_START[1], "L", CURSOR_X, CURSOR_Y]).attr({
      'stroke-width': 20
    });
    // Color the line you are making red as a warning that you are outside the table
    table.isPointInside(CURSOR_X, CURSOR_Y) ? DRAG_ELEMENT.attr({
      'stroke': 'blue'
    }) : DRAG_ELEMENT.attr({
      'stroke': 'red'
    });
  } else if (SKETCH_MODE === "CURSOR_MODE") {} else if (SKETCH_MODE === "COMPASS_MODE") {
    // We are going to place the north text  along the direction of this click
    moveCompass(CURSOR_X, CURSOR_Y);
  } else if (SKETCH_MODE === "BED_ST8_MODE") {
    // console.log("checking 1567");
  } else {
    console.log("Error  Table Start Drag 2");
  }
}

function table_end_drag() {
  table.toFront();
  if (SKETCH_MODE === "WALL_ST8_MODE") {
    if (!table.isPointInside(CURSOR_X, CURSOR_Y)) {
      // If your point is not inside the table, remove the element
      DRAG_ELEMENT.remove();
    }
    //        //if the wall is too small don't make it
    //        else if (distance([CURSOR_X, CURSOR_Y], [DRAG_START[0], DRAG_START[1]]) < 15) {
    //            DRAG_ELEMENT.remove();
    //        }
    else {
      GLOBAL_SKETCH_ALTERED = true;
      // Assign the wall you created properties
      bind_straight_wall_handlers(DRAG_ELEMENT);
    }
    // Reset the globals you used to drag/create this object
    DRAG_ELEMENT = undefined;
    DRAG_START = new Array();
  } else if (SKETCH_MODE === "WALL_CUR_MODE") {} else if (SKETCH_MODE === "WIN_ST8_MODE") {
    var length = Math.sqrt(Math.pow(CURSOR_X - DRAG_START[0], 2) + Math.pow(CURSOR_Y - DRAG_START[1], 2));
    if (!table.isPointInside(CURSOR_X, CURSOR_Y) || length < 20) {
      // If your point is not inside the table, remove the element
      DRAG_ELEMENT.remove();
    } else {
      // Assign the wall you created properties
      GLOBAL_SKETCH_ALTERED = true;
      bind_straight_win_handlers(DRAG_ELEMENT, true);
    }
    // Reset the globals you used to drag/create this object
    DRAG_ELEMENT = undefined;
    DRAG_START = new Array();
  } else if (SKETCH_MODE === "CURSOR_MODE") {} else if (SKETCH_MODE === "COMPASS_MODE") {
    DRAG_ELEMENT = undefined;
    DRAG_START = new Array();
  } else if (SKETCH_MODE === "BED_ST8_MODE") {
    // console.log("checking 1567");
  } else {
    console.log("Error Table End Drag 1");
  }
}
// ==================================================================
// Orientation event handlers
// ==================================================================
//only applicable when the orientation button has been pressed
function orientation_end_drag() {
  // orientation.toBack();
}
//only applicable when the orientation button has been pressed
function orientation_on_drag() {
  if (SKETCH_MODE === "COMPASS_MODE") {
    // We are going to place the north text  along the direction of this click
    GLOBAL_SKETCH_ALTERED = true;
    moveCompass(CURSOR_X, CURSOR_Y);
  }
}
//only applicable when the orientation button has been pressed
function orientation_start_drag() {
  if (SKETCH_MODE === "COMPASS_MODE") {
    // We are going to place the north text  along the direction of this click
    GLOBAL_SKETCH_ALTERED = true;
    moveCompass(CURSOR_X, CURSOR_Y);
  }
}
// ==================================================================
// Generation/Reading of wall and path files
// ==================================================================
function nan_pt(pt) {
  var isnan = isNaN(pt[0]) || isNaN(pt[1])
  return isnan;
}

function generate_wall_file(with_furniute) {
  // Default is false
  with_furniute = typeof with_furniute !== 'undefined' ? with_furniute : false;
  var long_lat = calc_long_lat(MAP_MARKER.attr('cx'), MAP_MARKER.attr('cy'), map);
  var log = "north " + toCompassRadians(getCompasAngle()) + "\n";
  log += "coordinates " + long_lat[0] + " " + long_lat[1] + "\n";
  log += "floor_material   1.000 1.000 1.000\n";
  log += "ceiling_material 1.000 1.000 1.000\n";
  log += "wall_material  1.000 1.000 1.000\n";
  log += "table 0.000000 0.000000 0.000000 0.537077\n";
  // For each wall/window on the table we save a line to our log file with it's coordinates
  paper.forEach(function (el) {
    // Filter out those which are not walls
    if (el.data('primitive') === 'WALL_ST8') {
      // Extract the points of our wall
      var wall_points = extractPathPoints(el);
      var corner_points = getCornerPoints(wall_points[0], wall_points[1]);
      // get the 4 corner of a a wall/window & center to table scale
      var uL = centerPoint(corner_points[0]);
      var uR = centerPoint(corner_points[1]);
      var lR = centerPoint(corner_points[2]);
      var lL = centerPoint(corner_points[3]);
      // Filter out the NaN's values ( I know it's hacky )
      if (!nan_pt(uL) && !nan_pt(uR) && !nan_pt(lR) && !nan_pt(lL)) {
        // Write to our string
        log += "wall  ";
        log += toStr(uL[0]) + "  " + toStr(uL[1]) + "  ";
        log += toStr(uR[0]) + "  " + toStr(uR[1]) + "  ";
        log += toStr(lR[0]) + "  " + toStr(lR[1]) + "  ";
        log += toStr(lL[0]) + "  " + toStr(lL[1]) + "  ";
        log += toStr(getHeight(8)) + "\n";
        // Now we will check if that wall had any windows
        var winArray = el.data('winArray');
        for (var i = 0; i < winArray.length; i++) {
          // Looking at this window
          var win = winArray[i];
          // Extract the points of our wall
          var win_points = extractPathPoints(win);
          var corner_points = getCornerPoints(win_points[0], win_points[1]);
          // get the 4 corner of a a wall/window & center to table scale
          var uL = centerPoint(corner_points[0]);
          var uR = centerPoint(corner_points[1]);
          var lR = centerPoint(corner_points[2]);
          var lL = centerPoint(corner_points[3]);
          // Write to our string
          log += "window  ";
          log += toStr(uL[0]) + "  " + toStr(uL[1]) + "  ";
          log += toStr(uR[0]) + "  " + toStr(uR[1]) + "  ";
          log += toStr(lR[0]) + "  " + toStr(lR[1]) + "  ";
          log += toStr(lL[0]) + "  " + toStr(lL[1]) + "  ";
          log += "cyan\n";
        }
      } //if nan
    }
  });
  if (with_furniute) {
    for (var i = 0; i < freetransform_list.length; i++) {
      var ftobj = freetransform_list[i],
        x = (ftobj.attrs.x + ftobj.attrs.translate.x),
        y = (ftobj.attrs.y + ftobj.attrs.translate.y),
        w = ftobj.attrs.size.x * ftobj.attrs.scale.x,
        h = ftobj.attrs.size.y * ftobj.attrs.scale.y,
        a = ftobj.attrs.rotate;
      // Getting raphael object called el
      var el = ftobj.subject;
      var object_str = el.data('primitive');
      if (object_str === "WARDROBE") {
        h = h / 3.0; // because of the open door image
      }
      // Initate
      var uL = new Array();
      var uR = new Array();
      var lR = new Array();
      var lL = new Array();
      // get the 4 corner of a a wall/window
      uL = upperLeftCorner(x, y, w, h, a, ftobj);
      uR = upperRightCorner(x, y, w, h, a, ftobj);
      lR = lowerRightCorner(x, y, w, h, a, ftobj);
      lL = lowerLeftCorner(x, y, w, h, a, ftobj);
      // debug visualization of points =====================
      // paper.circle(uL[0],uL[1],2).attr({fill: 'red'});
      // paper.circle(uR[0],uR[1],2).attr({fill: 'green'});
      // paper.circle(lL[0],lL[1],2).attr({fill: 'blue'});
      // paper.circle(lR[0],lR[1],2).attr({fill: 'white'});
      // remove debug =========================================
      // convert relative to center of the table
      uL = centerPoint(uL);
      uR = centerPoint(uR);
      lR = centerPoint(lR);
      lL = centerPoint(lL);
      // Print out the values that a wall file understands
      var data_pts = toStr(uL[0]) + "  " + toStr(uL[1]) + "  ";
      data_pts += toStr(uR[0]) + "  " + toStr(uR[1]) + "  ";
      data_pts += toStr(lR[0]) + "  " + toStr(lR[1]) + "  ";
      data_pts += toStr(lL[0]) + "  " + toStr(lL[1]) + "  ";
      switch (object_str) {
        case 'BED':
          log += "bed" + "  " + data_pts + "+0.0635\n";
          break;
        case 'DESK':
          log += "desk" + "  " + data_pts + "+0.0635\n";
          break;
        case 'WARDROBE':
          log += "wardrobe" + "  " + data_pts + "+0.1524\n";
          break;
        case 'SKYLIGHT':
          log += "skylight" + "  " + data_pts + "+0.000\n";
          break;
        default:
          alert("unknown furnite item saved to log");
          window.location = '../pages/login_page.php';
          break;
      }
    }
  }
  // console.log("============================== WALL FILE START ============================\n");
  // console.log(log);
  // console.log("============================== WALL FILE END ==============================");
  return log;
}

function generate_path_file(destructive) {
  // default argument
  destructive = typeof destructive !== 'undefined' ? destructive : false;
  var log = "";
  log += "COMPASS " + NORTH_TEXT.attr('x') + " " + NORTH_TEXT.attr('y') + "\n";
  log += "LOC " + Math.floor(MAP_MARKER.attr('cx')) / map.attr('width') + " " + Math.floor(MAP_MARKER.attr('cy')) / map.attr('height') + "\n";
  var radius = table.attr('r');
  var cx = table.attr('cx');
  var cy = table.attr('cy')
  // for each element on the canvas
  paper.forEach(function (el) {
    // Filter out those which are not walls
    if (el.data('primitive') === 'WALL_ST8') {
      log += "WALL_ST8\n"; // Writing the type of wall
      // Extract the points of our wall
      var wall_points = extractPathPoints(el);
      var wall_str = wall_points[0];
      var wall_end = wall_points[1];
      // Convert into string paths
      log += (Math.floor(wall_str[0]) - cx) / radius + " " + (Math.floor(wall_str[1]) - cy) / radius + " " + (Math.floor(wall_end[0]) - cx) / radius + " " + (Math.floor(wall_end[1]) - cy) / radius + "\n";
      // Now we will check if that wall had any windows
      var winArray = el.data('winArray');
      for (var i = 0; i < winArray.length; i++) {
        log += "WIN_ST8\n"; // Writing the type of win
        // Looking at this window
        var win = winArray[i];
        // Extract the points of our wall
        var win_points = extractPathPoints(win);
        var win_str = win_points[0];
        var win_end = win_points[1];
        log += (Math.floor(win_str[0]) - cx) / radius + " " + (Math.floor(win_str[1]) - cy) / radius + " " + (Math.floor(win_end[0]) - cx) / radius + " " + (Math.floor(win_end[1]) - cy) / radius + "\n";
        log += "END\n";
      }
      log += "END\n"; // We are done with info about this wall
    }
  });
  // ===========================================================
  // TODO: SAVE objects in path files
  // ===========================================================
  for (var i = 0; i < freetransform_list.length; i++) {
    var ft = freetransform_list[i];
    var rel_x = (ft.attrs.translate.x - cx) / radius;
    var rel_y = (ft.attrs.translate.y - cy) / radius;
    var a = ft.attrs.rotate;
    var sx = ft.attrs.scale.x; // new scaling factors
    var sy = ft.attrs.scale.y;
    var object_str = ft.subject.data('primitive');
    // Print out the values xthat a wall file understands
    log += object_str + "\n";
    log += rel_x + " " + rel_y + " " + a + " " + sx + " " + sy + "\n";
    log += "END\n";
  }
  // Will remove all elements from paper that are walls or wins
  if (destructive) {
    var destoryArr = new Array();
    // collect walls and win
    paper.forEach(function (el) {
      var type_el = el.data('primitive');
      if (type_el === "WALL_ST8" || type_el === "WIN_ST8" || type_el === "BED" || type_el === "DESK" || type_el === "WARDROBE") {
        destoryArr.push(el);
      }
    });
    // desotyr them
    for (var i = 0; i < destoryArr.length; i++) {
      destoryArr[i].remove();
    }
    // Removing all furniture items
    for (var i = 0; i < freetransform_list.length; i++) {
      ft.unplug();
      raphael_obj.remove();
    }
    // Yes things changed?
    GLOBAL_SKETCH_ALTERED = true;
  }
  return log;
}

function load_path_file(file_txt) {
  // console.log("==========PATH FILE===================");
  // console.log(file_txt);
  // console.log("^^^^^^^^^^^^^^^^^^^^^^^PATH FILE ^^^^^^^^^^^^^^^^^^^^^^^^");
  var radius = table.attr('r');
  var cx = table.attr('cx');
  var cy = table.attr('cy')
  // Spit this file by lines
  var pathfile = file_txt.split("\n");
  var cur_line = 0;
  var cur_wall = null;
  // Get compass positions
  var compos = pathfile[cur_line++].split(/[ ,]+/);
  moveCompass(parseInt(compos[1]), parseInt(compos[2]));
  var coor = pathfile[cur_line++].split(/[ ,]+/);
  move_marker(parseFloat(coor[1]) * map.attr('width'), parseFloat(coor[2]) * map.attr('height'));
  // For each line inside the file
  while (cur_line < pathfile.length) {
    var cur_string = pathfile[cur_line];
    switch (cur_string) {
      case "WALL_ST8":
        // Create wall and bind handlers
        var s = pathfile[++cur_line].split(" ");
        cur_wall = paper.path("M" + (s[0] * radius + cx) + "," + (s[1] * radius + cy) + "L" + (s[2] * radius + cx) + "," + (s[3] * radius + cy));
        bind_straight_wall_handlers(cur_wall);
        cur_line++;
        break;
      case "WIN_ST8":
        // Create window and bind handlers
        var t = pathfile[++cur_line].split(" ");
        var cur_win = paper.path("M" + (t[0] * radius + cx) + "," + (t[1] * radius + cy) + "L" + (t[2] * radius + cx) + "," + (t[3] * radius + cy));
        bind_straight_win_handlers(cur_win, false);
        // Save cur wall to window elt
        cur_win.data("wall", cur_wall);
        // Save this window to this wall elt
        var winArray = cur_wall.data('winArray');
        winArray.push(cur_win);
        cur_wall.data('winArray', winArray);
        cur_line++;
        break;
      case "BED":
        // Create a bed
        var ft = bind_furniture_handlers(create_bed(0, 0), "BED");
        var u = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle
        // Move to the center of canvas
        ft.attrs.translate.x = (u[0] * radius) + cx;
        ft.attrs.translate.y = (u[1] * radius) + cy;
        ft.attrs.rotate = u[2];
        ft.apply();
        ft.updateHandles();
        cur_line++;
        break;
      case "DESK":
        // Create a desk
        var ft = bind_furniture_handlers(create_desk(0, 0), "DESK");
        var u = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle
        // Move to the center of canvas
        ft.attrs.translate.x = (u[0] * radius) + cx;
        ft.attrs.translate.y = (u[1] * radius) + cy;
        ft.attrs.rotate = u[2];
        ft.apply();
        ft.updateHandles();
        cur_line++;
        break;
      case "WARDROBE":
        // Create a closest
        var ft = bind_furniture_handlers(create_closest(0, 0), "WARDROBE");
        var u = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle
        // Move to the center of canvas
        ft.attrs.translate.x = (u[0] * radius) + cx;
        ft.attrs.translate.y = (u[1] * radius) + cy;
        ft.attrs.rotate = u[2];
        ft.apply();
        ft.updateHandles();
        cur_line++;
        break;
      case "SKYLIGHT":
        // Create a closest
        var ft = bind_skylight_handlers(create_skylight(0, 0), "SKYLIGHT");
        var u = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle, sx, sy
        // Move to the center of canvas
        ft.attrs.translate.x = (u[0] * radius) + cx;
        ft.attrs.translate.y = (u[1] * radius) + cy;
        ft.attrs.rotate = u[2];
        ft.attrs.scale.x = u[3];
        ft.attrs.scale.y = u[4];
        ft.apply();
        ft.updateHandles();
        cur_line++;
        break;
      case "END":
        cur_line++;
        break;
      case "":
        cur_line++;
        break;
      default:
        console.log("ERROR: Reading path file syntax broken");
    }
  }
  // Set to cursor mode
  cursorMode();
}
// ==================================================================
// AJAX calls to save/load model to database
// ==================================================================
function busy_ajax(msg) {
  // Set loading gif
  var status_pane = document.getElementById('status_pane');
  status_pane.innerHTML = " " + msg;
  if (msg === "Saving Feedback") {
    GLOBAL_FEEDBACK_STATUS = "SAVING";
  }
  var load_img = document.createElement("img");
  load_img.src = "../images/small-loader.gif";
  $('#status_pane').prepend(load_img);
}

function ready_ajax(msg) {
  // Set loading gif
  var status_pane = document.getElementById('status_pane');
  if (msg = "Feedback Saved") {
    status_pane.innerHTML = "<img src=\"../images/tiny_save.png\"> &nbsp" + msg;
  } else {
    status_pane.innerHTML = msg;
  }
}

function new_model() {
  // console.log("Running alert function");
  busy_ajax("Saving model");
  // Tell the server to save this model
  $.post("../php/new_model_session.php", {}, function () {
    // Call function once model is saved
    // alert("new_model_session ran");
    save_form('fb_load_form'); // Saving before window swtich
    window.location = "../pages/sketching_tab.php";
  });
}

function update_3d_model(redirect_url) {
  // if run_remesh is set to false, then we do not try to run remesh and force a window change
  // if run_remesh is set to true, then we do try to run remesh and forace a window change
  var run_remesh = redirect_url === "../pages/3d_tab.php";
  // Disable the ribbon
  SKETCH_MODE = "CURSOR_MODE";
  window.ribbon1.disableRibbon();
  busy_ajax("Generating 2D Model");
  // Get model status and make the correct call as to which script to run
  //  $.getJSON("../php/get_session_model.php", {}, function(e) {
  //    var stat = e.stat;
  //    var session_wallfile_text = e.wallfile_text;
  //    busy_ajax("Saving Model");
  //    //    console.loc(stat);
  //    console.log(stat);
  //    if (stat === 'New' || stat === 'New Edited') {
  //      // Tell the server to save this model
  //      $.post("../php/save_model_db.php", {}, function() {
  //        console.log('3', document.getElementById('title_frm'));;
  //        //aka needs to have windows to work
  //        if (run_remesh && (hasWindows() || modelHasWindows())) {
  //          // Call function once model is saved
  //          busy_ajax("Generating 3D Model");
  //          // console.log("Making a call to task_remesh.php");
  //          new_or_old_sketching(3, redirect_url);
  //        } else {
  //          if (run_remesh) {
  //            save_form('fb_sketch_form');
  //            //alert("Windows are required to run simulations");
  //            bootbox.alert("Windows are required to run simulations", function() {
  //              window.location = window.location;
  //            });
  //          } else {
  //            save_form('fb_sketch_form');
  //            window.location = redirect_url;
  //          }
  //        }
  //      });
  //    } else if (stat === 'Exisiting') {
  //      // console.log("Making a call to update_model_db.php");
  //      // Tell the server to save this model
  //      $.post("../php/update_model_db.php", {}, function() {
  //        if (run_remesh && (hasWindows() || modelHasWindows())) {
  //          // Call function once model is saved
  //          busy_ajax("Generating 3D Model");
  //          new_or_old_sketching(3, redirect_url);
  //        } else {
  //          if (run_remesh) {
  //            save_form('fb_sketch_form');
  //            //alert("Windows are required to run simulations");
  //            bootbox.alert("Windows are required to run simulations", function() {
  //              window.location = window.location;
  //            });
  //          } else {
  //            save_form('fb_sketch_form');
  //            window.location = redirect_url;
  //          }
  //        }
  //      });
  //    } else {
  //      alert("Error: Invalid stat in session model:\n" + stat);
  //      window.location = "../pages/login_page.php";
  //    }
  //  });
}

function update_model() {
  // Call AJAX function
  // Disable the ribbon
  SKETCH_MODE = "CURSOR_MODE";
  window.ribbon1.disableRibbon();
  busy_ajax("Updating Model");
  // Tell the server to save this model
  //  $.post("../phkaljsdlkf jp/update_model_db.php", {
  //    title: document.getElementById('title_frm').title.value,
  //    wallfile_txt: generate_wall_file(true),
  //    paths_txt: generate_path_file()
  //  }, function() {
  //    // Call function once model is saved
  //    // console.log("Model Updated to Database");
  //    window.ribbon1.enableRibbon();
  //  });
}

function load_previous_model(unique_id) {
  // This function is triggered when user clicks on prev
  // model.
  // It makes an AJAX call to update the current working model
  busy_ajax("Loading Model");
  //  $.post("../php/load_model_session.php", {
  //    id: unique_id
  //  }, function callback() {
  //    window.location = "../pages/sketching_tab.php";
  //  }); //ajax
}

function load_sketch_init() {
  //   Froms an ajax call to the server to get data of the working model
  //  $.getJSON("../php/get_session_model.php", {}, function (e) {
  //    // Call back function once we get back the working model
  //    var username = e.username;
  //    var stat = e.stat;
  //    var title = e.title;
  //    var paths_txt = e.paths_txt;
  //    var wallfile = e.wallfile_text;
  //    if (wallfile != " ") {
  //      if (isJson(wallfile)) {
  //        IS_NEW_MODEL = 2;
  //        $("#container").toggle();
  //        $("#sketchpad").toggle();
  //        if (stat === "Exisiting" || stat === "New Edited") {
  //          //load the strokes in
  //          loadFile(wallfile);
  //          document.getElementById('title_frm').title.value = title;
  //        } else if (stat === "New") {
  //          document.getElementById('title_frm').title.value = get_random_name();
  //          document.getElementById('dev_info').innerHTML = "New model, not saved yet";
  //        } else {
  //          // We shouldn't ever reach this
  //          alert("Recived from get_session_model.php: " + stat);
  //          window.location = "../pages/login_page.php";
  //        }
  //      } else if (stat === "Exisiting" || stat === "New Edited") {
  //        IS_NEW_MODEL = 1;
  //        // console.log("Loading Exisiting Model From Session");
  //        load_path_file(paths_txt);
  //        document.getElementById('title_frm').title.value = title;
  //        //        $.ajax({
  //        //          type: "POST",
  //        //          url: "../php/is_developer.php",
  //        //          async: true,
  //        //          success: function(e) {
  //        //            var json = JSON.parse(e);
  //        //            var usertype = json.data;
  //        //            if (usertype === "developer") {
  //        //              // put in dev tool
  //        //              $.getJSON("../php/get_dev_info.php", {}, function(e) {
  //        //                var hashed_username = e.hashed;
  //        //                var model_id = e.id;
  //        //                document.getElementById('dev_info').innerHTML = '/user_output/' + hashed_username + '/model_' + model_id;
  //        //              });
  //        //            }
  //        //          },
  //        //          error: function(e) {
  //        //            console.log("Failed to determine if developer");
  //        //          }
  //        //        });
  //      } else if (stat === "New") {
  //        document.getElementById('title_frm').title.value = get_random_name();
  //        // console.log("Loading New Model From With Blank Session");
  //        document.getElementById('dev_info').innerHTML = "New model, not saved yet";
  //      } else {
  //        // We shouldn't ever reach this
  //        alert("Recived from get_session_model.php: " + stat);
  //        window.location = "../pages/login_page.php";
  //      }
  //    } else {}
  //  }).success(function () {
  //    if (IS_NEW_MODEL === 0) {
  //      $('#chooseType').modal('show');
  //    }
  //    if (IS_NEW_MODEL === 1) {}
  //    if (IS_NEW_MODEL === 2) {
  //      // $("#container").toggle();
  //      // $("#sketchpad").toggle();
  //    }
  //  });

  document.getElementById('title_frm').title.value = get_random_name();
}

function hasWindows() {
  var windows = 0;
  paper.forEach(function (el) {
    // Filter out those which are not walls
    if (el.data('primitive') === 'WIN_ST8' || el.data('primitive') === 'SKYLIGHT') {
      windows++;
    }
  });
  return windows > 0;
}

function did_change_happen() {
  // var wall_count = 0;
  // var win_count = 0;
  // // Here we are going to
  // paper.forEach(
  //   function(el)
  //   {
  //   // Filter out those which are not walls
  //   if (el.data('primitive') === 'WALL_ST8') { wall_count++; }
  //   if (el.data('primitive') === 'WIN_ST8') { win_count++; }
  //   }
  // );
  return GLOBAL_SKETCH_ALTERED;
}
//deletes the div that is holding the button
function delete_div(e) {
  e.parentNode.parentNode.removeChild(e.parentNode);
}
// ==================================================================
// Task Manager Functions
// ==================================================================
function generate_new_task() {
  // ====================================================================================
  // Form
  // ====================================================================================
  var task_id = "new_task_form_" + new_task_count;
  var f = document.createElement("form");
  f.setAttribute('id', task_id);
  f.setAttribute('action', '');
  task_form_id_array.push(task_id); // Pushing into our array
  // console.log("Created a new task entry: " + task_id);
  new_task_count++;
  // ====================================================================================
  // Title
  // ====================================================================================
  var label = document.createElement("b");
  label.innerHTML = "Title: ";
  var title = "";
  //  $.ajax({
  //    type: "POST",
  //    url: "../php/get_model_title.php",
  //    async: false,
  //    success: function(e) {
  //      var json = JSON.parse(e);
  //      title += json.data;
  //    }
  //  });
  var padded_title = title;
  for (var i = 0; i < 32 - title.length; i++) {
    padded_title += "\u00a0";
  }
  var t = document.createTextNode(padded_title);
  f.appendChild(label);
  f.appendChild(t);
  // ====================================================================================
  // Date
  // ====================================================================================
  label = document.createElement("b");
  label.innerHTML = "<br>Date: ";
  var date = document.createElement("input");
  date.setAttribute('type', "date");
  date.setAttribute('name', "date");
  date.setAttribute('value', "2015-01-01");
  f.appendChild(label);
  f.appendChild(date);
  // ====================================================================================
  // Time
  // ====================================================================================
  label = document.createElement("b");
  label.innerHTML = "\u00a0Time: ";
  var time = document.createElement("input");
  time.setAttribute('type', "time");
  time.setAttribute('name', "time");
  time.setAttribute('value', "13:00:00");
  f.appendChild(label);
  f.appendChild(time);
  //and some more input elements here
  //and dont forget to add a submit button
  // ====================================================================================
  // Timezone
  // ====================================================================================
  label = document.createElement("b");
  label.innerHTML = "\u00a0<br>Timezone: ";
  var timezone = document.createElement('select');
  timezone.setAttribute('name', "timezone");
  createOption(timezone, "(GMT -12:00) Eniwetok, Kwajalein", "-12:00"); //0
  createOption(timezone, "(GMT -11:00) Midway Island, Samoa", "-11:00");
  createOption(timezone, "(GMT -10:00) Hawaii", "-10:00");
  createOption(timezone, "(GMT -9:00) Alaska", "-9:00");
  createOption(timezone, "(GMT -8:00) Pacific Time US, Canada", "-8:00"); //4
  createOption(timezone, "(GMT -7:00) Mountain Time US, Canada", "-7:00");
  createOption(timezone, "(GMT -6:00) Central Time US, Canada, Mexico City", "-6:00");
  createOption(timezone, "(GMT -5:00) Eastern Time US, Canada, Bogota", "-5:00");
  createOption(timezone, "(GMT -4:00) Atlantic Time Canada, Caracas, La Paz", "-4:00");
  createOption(timezone, "(GMT -3:30) Newfoundland", "-3.30"); // 9
  createOption(timezone, "(GMT -3:00) Brazil, Buenos Aires, Georgetown", "-3:00");
  createOption(timezone, "(GMT -2:00) Mid-Atlantic", "-2:00");
  createOption(timezone, "(GMT -1:00 hour) Azores, Cape Verde Islands", "-1:00");
  createOption(timezone, "(GMT) Western Europe Time, London, Lisbon", "0:00");
  createOption(timezone, "(GMT +1:00) Brussels, Copenhagen, Madrid, Paris", "1:00"); //14
  createOption(timezone, "(GMT +2:00) Kaliningrad, South Africa", "2:00");
  createOption(timezone, "(GMT +3:00) Baghdad, Riyadh, Moscow", "3:00");
  createOption(timezone, "(GMT +3:30) Tehran", "3:30");
  createOption(timezone, "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi", "4:00");
  createOption(timezone, "(GMT +4:30) Kabul", "4:30"); //19
  createOption(timezone, "(GMT +5:00) Ekaterinburg, Islamabad, Karachi", "5:00");
  createOption(timezone, "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi", "5:30");
  createOption(timezone, "(GMT +5:45) Kathmandu", "5:45");
  createOption(timezone, "(GMT +6:00) Almaty, Dhaka, Colombo", "6:00");
  createOption(timezone, "(GMT +7:00) Bangkok, Hanoi, Jakarta", "7:00"); //24
  createOption(timezone, "(GMT +8:00) Beijing, Singapore, Hong Kong", "8:00");
  createOption(timezone, "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo", "9:00");
  createOption(timezone, "(GMT +9:30) Adelaide, Darwin", "9:30");
  createOption(timezone, "(GMT +10:00) Eastern Australia, Guam", "10:00");
  createOption(timezone, "(GMT +11:00) Magadan, Solomon Islands", "11:00"); //29
  createOption(timezone, "(GMT +12:00) Auckland, Wellington, Fiji", "12:00");
  var num;
  //hacky way of getting the longitude
  //  $.get("../php/get_map_coords.php", function(e) {
  //    var s = e.split("\n");
  //    s = s[1].split(" ");
  //    num = s[2];
  //    num = estimate_time_zone(num);
  //    timezone.selectedIndex = num;
  //  });
  f.appendChild(label);
  f.appendChild(timezone);
  // ====================================================================================
  // Weather
  // ====================================================================================
  label = document.createElement("b");
  label.innerHTML = "\u00a0<br>Weather: ";
  var select = document.createElement('select');
  select.setAttribute('name', "weather");
  createOption(select, "clear", "CLEAR");
  createOption(select, "turbid", "TURBID");
  createOption(select, "intermediate", "INTERMEDIATE");
  createOption(select, "overcast", "OVERCAST");
  f.appendChild(label);
  f.appendChild(select);
  // ====================================================================================
  // Submit Button
  // ====================================================================================
  var btn = document.createElement("BUTTON");
  var t = document.createTextNode("\u00a0\u00a0submit\u00a0\u00a0");
  btn.onclick = function () {
    //save_non_submitted_task(task_id); // Makes call to save_non_submitted_task.php
    create_daylight_task(task_id);
    delete_div(this);
    $("#task_list").load("../php/reload_task_page.php");
    new_task_count--;
    return false;
  };
  btn.appendChild(t);
  f.appendChild(document.createTextNode("\u00a0\u00a0"));
  f.appendChild(btn);
  line = document.createElement("b");
  line.innerHTML = "<hr class='newtaskline'>";
  f.appendChild(line);
  // ====================================================================================
  // Final Append
  // ====================================================================================
  $('#new_task_list').prepend(f);
}

function create_daylight_task(task_id) {
  // Packages up the form elements and makes a call to task_daylight.php
  var mn = document.getElementById(task_id).date.value.split("-")[1];
  var dd = document.getElementById(task_id).date.value.split("-")[2];
  var hh = document.getElementById(task_id).time.value.split(":")[0];
  var mi = document.getElementById(task_id).time.value.split(":")[1];
  var timezone_hour = document.getElementById(task_id).timezone.value.split(":")[0];
  var timezone_min = document.getElementById(task_id).timezone.value.split(":")[1];
  var w = document.getElementById(task_id).weather.value;
  var timezone_sign = 1;
  if (timezone_hour < 0) {
    timezone_sign = -1;
    //we don't want a negative hour
    timezone_hour = timezone_hour * -1;
  }
  // Tell the server to save this model
  $.post("../php/task_daylight.php", {
    month: mn,
    day: dd,
    hour: hh,
    minute: mi,
    tz_sign: timezone_sign,
    tz_hr: timezone_hour,
    tz_min: timezone_min,
    weather: w,
    t_called: Math.floor(new Date().getTime() / 1000)
  }, function () {
    sketching_ribbon_handler('button-daylight-refresh');
  });
}

function generate_task_object(task_id) {
  // alert("genearting task object " + task_id);
  // This function will generate a task object
  var task_obj = {};
  var d = document.getElementById(task_id).date.value;
  var t = document.getElementById(task_id).time.value;
  var w = document.getElementById(task_id).weather.value;
  task_obj.date = d;
  task_obj.time = t;
  task_obj.weather = w;
  return task_obj;
}

function generate_task_array() {
  var task_obj_array = new Array();
  for (var i = 0; i < task_form_id_array.length; i++) {
    task_obj_array.push(generate_task_object(task_form_id_array[i]));
  }
  return task_obj_array;
}

function dump_errors_log(id) {
  var oFrame = document.getElementById("frmFile");
  var strRawContents = oFrame.contentWindow.document.body.childNodes[0].innerHTML;
  while (strRawContents.indexOf("\n") >= 0) {
    strRawContents = strRawContents.replace("\n", "<br>");
  }
  // console.log(strRawContents);
  document.getElementById('error_pane').innerHTML = "<hr><b>Error Log:</b> Model " + id + "</center><br>" + strRawContents;
}

function load_error(id, path) {
  //  $.ajax({
  //    type: "POST",
  //    url: "../php/is_developer.php",
  //    async: false,
  //    success: function(e) {
  //      var json = JSON.parse(e);
  //      var usertype = json.data;
  //      if (usertype === "normal") {
  //        // put in developer tool
  //        bootbox.alert("Simulation failed: Create new task with the same parameters to try again", function() {});
  //      }
  //      if (usertype === "developer") {
  //        // put in normal tool
  //        // TODO set this up so this only happens when we have developer mode
  //        var error_dump = document.createElement("iframe");
  //        error_dump.setAttribute('id', "frmFile");
  //        error_dump.setAttribute('src', path + "errors.log");
  //        error_dump.setAttribute('onload', "dump_errors_log(" + id + ")");
  //        error_dump.setAttribute('style', "display: none;");
  //        $('#error_pane').prepend(error_dump);
  //      }
  //    },
  //    error: function(e) {
  //      busy_ajax("Simulation failed: Create new task with same inputs to re-run");
  //      setTimeout(function() {
  //        ready_ajax("Ready");
  //      }, 3000);
  //    }
  //  });
}

function load_res(id, path) {
  // Disable the other tools
  SKETCH_MODE = "CURSOR_MODE";
  window.ribbon1.disableRibbon();
  // Make an AJAX call to this function
  $.post("../php/loading_prev_sim.php", {
    id: id,
    path: path
  }, function callback() {
    window.location = "../pages/sim_tab.php";
  }); //ajax
}

function delete_model(id, path) {
  alert("Not actually working!");
}

function convert_GMT(local_hour, local_min, timezone_sign, timezone_hour, timezone_min) {
  // assuming all is 24 hour time
  var GMT_hour = local_hour + -1 * s * timezone_hour;
  var GMT_min = local_min + -1 * s * timezone_min;
  return [GMT_hour, GMT_min];
}
// ==================================================================
// Gets the compass angles in radians
// ==================================================================
function getCornerPoints(start_pt, end_pt) {
  // Creates this array of four points
  // index 0 -- upper left corner
  // index 1 -- upper right corner
  // index 2 -- lower left corner
  // index 3 -- lower right corner
  var dirVec = convertLine2Vector(start_pt, end_pt);
  var perVec = perpendicularVec(dirVec);
  var upper_left = new Array();
  upper_left[0] = start_pt[0] + perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  upper_left[1] = start_pt[1] + perVec[1] * (PRIMITIVE_WIDTH / 2.0);
  var lower_left = new Array();
  lower_left[0] = start_pt[0] - 1 * perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  lower_left[1] = start_pt[1] - 1 * perVec[1] * (PRIMITIVE_WIDTH / 2.0);
  var upper_right = new Array();
  upper_right[0] = end_pt[0] + perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  upper_right[1] = end_pt[1] + perVec[1] * (PRIMITIVE_WIDTH / 2.0);
  var lower_right = new Array();
  lower_right[0] = end_pt[0] - 1 * perVec[0] * (PRIMITIVE_WIDTH / 2.0);
  lower_right[1] = end_pt[1] - 1 * perVec[1] * (PRIMITIVE_WIDTH / 2.0);
  return [upper_left, lower_left, lower_right, upper_right];
  // return [ upper_left, upper_right, lower_right, lower_left ]; // orginal
  // return [ upper_left, lower_left, upper_right, lower_right ];
}
// ==================================================================
// Sidecontent show/hide
// ==================================================================
function show_id(id) {
  var id_show;
  if (document.getElementById(id).style.display === "block") {
    id_show = "feedback";
  } else {
    id_show = id;
  }
  var itemDivs = document.getElementById("sidecontent").children;
  for (var i = 0; i < itemDivs.length; i++) {
    if (itemDivs[i] === document.getElementById(id_show)) {
      itemDivs[i].style.display = 'block';
    } else itemDivs[i].style.display = 'none';
  }
}

function show_side_task(id) {
  var id_show;
  if (document.getElementById(id).style.display === "block") {
    id_show = "";
  }
  //the side bar is not out
  else {
    id_show = id;
  }
  if (id_show === id) {
    document.getElementById("maincontent_task").style.width = "70%";
    document.getElementById("sidecontent_task").style.display = "block";
    document.getElementById("sidecontent_task").style.width = "30%";
    var itemDivs = document.getElementById("sidecontent_task").children;
    for (var i = 0; i < itemDivs.length; i++) {
      itemDivs[i].style.display = 'none';
    }
    document.getElementById(id).style.display = "block";
  } else {
    document.getElementById("maincontent_task").style.width = "100%";
    document.getElementById("sidecontent_task").style.display = "none";
    document.getElementById("sidecontent_task").style.width = "0";
    var itemDivs = document.getElementById("sidecontent_task").children;
    document.getElementById(id).style.display = "none";
  }
}
