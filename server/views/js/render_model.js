//==============================================================================
// GLOBALS FOR MODEL DATA
//==============================================================================
// Where we are looking for the materials files
var mtl_file_name = "";
var has_textures = true;
var obj_format = 'NaN';
var path = "Not_Assigned";

// Where we put the camera,scene, and render
var container;

// Required to render WebGL elements through three.js
var camera, scene, light, renderer;

var ceiling;

// Default set to match sketching plan view

// initial camera location
var CAMERA_X = 0;
var CAMERA_Y = 80;
var CAMERA_Z = 0;

// var CAMERA_ROT_X = -3.14159265359/2.0;
var CAMERA_ROT_X = -3.14159265359 / 2.0;
var CAMERA_ROT_Y = 0;
var CAMERA_ROT_Z = 3.14159265359;

// size of canvas
var HEIGHT = document.getElementById('container').offsetHeight;
var WIDTH = document.getElementById('container').offsetWidth;

// stores data found in obj file
var v = []; // verticies
var vt = []; // tecture coor
var vn = []; // normals
var o; // index in object file

// meshes for different items
var mesh = [];
var material = [];

//variables for storing image info
var image_names = [];
var image_textures = [];
var image_materials = [];

//geometry for the faces
var geometries = [];

// all the veritices
var all_vertices = [];

// will keep track of keyboard calls
var keyboard;


//==============================================================================
// Mouse interaction Globals
//==============================================================================

// rotation variables
var targetRotationX = 0;
var targetRotationY = 0;
var targetRotationOnMouseDownX = 0;
var targetRotationOnMouseDownY = 0;

// translation variables
var targetTranslationX = 0;
var targetTranslationY = 0;
var targetTranslationZ = 0;
var targetTranslationOnMouseDownX = 0;
var targetTranslationOnMouseDownY = 0;

// zoom variables
var targetZoomY = 0;
var targetZoomOnMouseDownY = 0;

// mouse variables for transformations
var mouseX = 0;
var mouseXOnMouseDown = 0;
var mouseY = 0;
var mouseYOnMouseDown = 0;


// used to limit where you can click on screen
// TODO: Remove this functionality

//==============================================================================
// AYSNC INIT CALL STARTS LOADING
//==============================================================================
// Using ajax call to get where to look to load this model
$.getJSON(
  '../php/get_view_path.php', {},
  function(e) {
    // We got the view_path back from server
    path = e.result;
    var id_val = path.substring(38);
    var temp_val = "";
    for (var i = 0; i < id_val.length; i++) {
      if (id_val[i] == '/')
        break;
      temp_val += id_val[i];
    }
    id_val = temp_val;

    var path_button = document.createElement("input");
    path_button.setAttribute("value", "http://hurricane.cs.rpi.edu/temp/test.php?path=" + path + "&id=" + id_val);
    path_button.setAttribute("id", "path_button");
    path_button.setAttribute("class", "control-label");
    //  path_button.setAttribute("size","50");
    path_button.setAttribute("style", "margin-right:10px;width:80%;")
    path_button.setAttribute("readonly", "true");
    document.getElementById("sidecontent").appendChild(path_button);

    var copy_button = document.createElement("button");
    copy_button.setAttribute("type", "button");
    copy_button.setAttribute("class", "btn btn-default");
    copy_button.setAttribute("data-toggle", "popover");
    copy_button.setAttribute("data-placement", "bottom");
    copy_button.setAttribute("data-content", "copied");
    copy_button.setAttribute("onclick", "copy()");
    copy_button.setAttribute("data-clipboard-target", "#path_button");
    var copy_icon = document.createElement("img");
    copy_icon.setAttribute("src", "../images/clippy.svg");
    copy_icon.setAttribute("alt", "Copy to Clipboard");
    copy_icon.setAttribute("width", "10");
    copy_button.appendChild(copy_icon);
    document.getElementById("sidecontent").appendChild(copy_button);

    if (path == null) {

      bootbox.alert("No Sketch To Convert, Please Create a Sketch", function() {
        window.location = "../pages/load_tab.php";
      });

      // alert("No Sketch To Convert, Please Create a Sketch");
      // window.location = "../pages/load_tab.php";
    }

    // Do we have foo.obj file
    $.ajax({
      url: path + 'foo.obj',
      type: 'HEAD',
      error: function() {

        if (path.split("/")[4] == "results") {
          // We have nothing to render

          bootbox.alert("Error: Could not run daylighting simulations, make changes and try again", function() {
            window.location = "../pages/task_tab.php";
          });
        } else {
          // Geometry, error, go back to sketching
          bootbox.alert("Error: Could not interpret 3D geometry, make changes and try again", function() {
            global_tab_handler("tab-sketch");
          });
        }
      },
      success: function() {
        // We have obj to render, do we have textures?
        objFileContents.fetch(path + "foo.obj");
        objFileContents.parse();

        $.ajax({
          url: path + 'errors.log',
          type: 'HEAD',
          error: function() {
            has_textures = false;
            // window.ribbon1.disableTools(["button-3d-fcv"]);
            init();
            animate();
          },
          success: function() {
            has_textures = true;
            // window.ribbon1.disableTools(["button-3d-ceiling"]);
            init();
            animate();
          }
        });
      }
    });
  }
);


function init() {
  // Create the div in which the WebGL Rendering will open
  container = document.getElementById("container");

  // Camera Creation ___________________________________________________________
  //last two values are near and far clipping planes
  // camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 5, 120);
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 5, 1000);
  camera.position.x = CAMERA_X;
  camera.position.y = CAMERA_Y;
  camera.position.z = CAMERA_Z;
  camera.rotation.x = CAMERA_ROT_X;
  camera.rotation.y = CAMERA_ROT_Y;
  camera.rotation.z = CAMERA_ROT_Z;

  // Scene Creation_____________________________________________________________
  scene = new THREE.Scene();

  if (!has_textures) {

    light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(0, 1, 0);
    scene.add(light);

  }

  // This functon loads in all there verticies and sets up
  // the webgl objects required to view a mesh
  getObjData();

  // console.log("Num geometries: " + geometries.length +
  // "  Num materials: " + image_materials.length);


  // creates the geometries from the data in the obj file aka wall
  for (var g = 0; g < geometries.length; g++) {

    // For every face in the geo, set its color to random
    // for (var i = 0; i < geometries[g].faces.length; i++)
    // {
    //   var hex = Math.random() * 0xffffff;
    //   geometries[g].faces[i].color.setHex(hex);
    // }

    // For every geo we have, push a material file in
    // material.push(new THREE.MeshBasicMaterial(
    // {
    //   vertexColors: THREE.FaceColors, // color the vertex the same as the faces
    //   overdraw: 0.5 // removes artifacts
    // }));

    // The mesh we are going to render
    mesh.push(new THREE.Mesh(geometries[g], image_materials[g]));

    // material[g].side = THREE.DoubleSide;
    // mesh[g].doubleSided = true;
    // mesh[g].position.y = 0;
    // mesh[g].position.z = 0;
    // mesh[g].rotation.y = 0;
    scene.add(mesh[g]);

  }

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(WIDTH, HEIGHT);
  //renderer.setViewport(window.innerWidth/4,window.innerHeight/10,WIDTH,HEIGHT);
  //var renderer_position = renderer.getPosition();
  //renderer.setPosition(window.innerWidth/2, 0);
  //renderer.setSize( window.innerWidth, window.innerHeight );

  container.appendChild(renderer.domElement);

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  //window.addEventListener( 'resize', onWindowResize, false );

  keyboard = new THREEx.KeyboardState();
}

// called by init
function getObjData() {
  // get the name of the mtl file; it is the second thing on the first line
  mtl_file_name = objFileContents.vectors[0][1];

  // go through the objFileContents ( one offset )
  for (o = 1; o < objFileContents.vectors.length; o++) {
    // new vertex defined on this line
    if (objFileContents.vectors[o][0] == "v") {

      //use v.length to add one to the length and add x,y, and z components
      v.push(new Array());

      v[v.length - 1].push(objFileContents.vectors[o][1]);
      v[v.length - 1].push(objFileContents.vectors[o][2]);
      v[v.length - 1].push(objFileContents.vectors[o][3]);

      // how I would like to add vertices to the geometry
      // those scalars are magic constants I use for making the image larger
      all_vertices.push(new THREE.Vector3(50 * v[v.length - 1][0], 50 * v[v.length - 1][1], 50 * v[v.length - 1][2]));

    }

    // get the texture coordinates for each vertex
    else if (objFileContents.vectors[o][0] == "vt") {

      vt.push(new Array());

      //multiply texture coordinates by .999 for threejs cutoff
      vt[vt.length - 1].push(objFileContents.vectors[o][1] * 0.999);
      vt[vt.length - 1].push(objFileContents.vectors[o][2] * 0.999);

    }

    // get the normals for each vertex
    else if (objFileContents.vectors[o][0] == "vn") {
      vn.push(new Array());
      vn[vn.length - 1].push(objFileContents.vectors[o][1]);
      vn[vn.length - 1].push(objFileContents.vectors[o][2]);
      vn[vn.length - 1].push(objFileContents.vectors[o][3]);
    }
    // adding a new face
    else if (objFileContents.vectors[o][0] == "f") {

      // format_type == 1 we have f # # #
      // format_type == 3 we have f #/#/# #/#/#

      if (obj_format == "NaN") {
        if (1 == objFileContents.vectors[o][1].split("/").length) {
          obj_format = "basic";
        } else {
          obj_format = "redundent";
        }
      }

      if (obj_format == 'basic') {

        //format is .  Pull apart to only grab # in temp_vertex_*[0]
        var temp_vertex_1 = objFileContents.vectors[o][1]; //3 vertices in the face
        var temp_vertex_2 = objFileContents.vectors[o][2];
        var temp_vertex_3 = objFileContents.vectors[o][3];

        //using -1 because the vertices are 1-indexed
        if (geometries.length == 0)
          console.log("ASSERT!!");
        geometries[geometries.length - 1].faces.push(
          new THREE.Face3(
            temp_vertex_1 - 1,
            temp_vertex_2 - 1,
            temp_vertex_3 - 1));

        //add texture coordinates flopping x and y coordinates
        /*
        geometries[geometries.length - 1].faceVertexUvs[0].push([
          new THREE.Vector2(vt[temp_vertex_1 - 1], vt[temp_vertex_1 - 1][0]),
          new THREE.Vector2(vt[temp_vertex_2 - 1], vt[temp_vertex_2 - 1][0]),
          new THREE.Vector2(vt[temp_vertex_3 - 1], vt[temp_vertex_3 - 1][0])
        ]);
        */
      } else {
        //format is #/#/#.  Pull apart to only grab # in temp_vertex_*[0]
        var temp_vertex_1 = objFileContents.vectors[o][1]; //3 vertices in the face
        var temp_vertex_2 = objFileContents.vectors[o][2];
        var temp_vertex_3 = objFileContents.vectors[o][3];
        //console.log(temp_vertex_1);
        // each has [i1,i1,i1]
        temp_vertex_1 = temp_vertex_1.split("/");
        temp_vertex_2 = temp_vertex_2.split("/");
        temp_vertex_3 = temp_vertex_3.split("/");

        //using -1 because the vertices are 1-indexed
        if (geometries.length == 0) console.log("ASSERT!!");

        // Pushing a face, into geometeries obj
        geometries[geometries.length - 1].faces.push(new THREE.Face3(temp_vertex_1[0] - 1, temp_vertex_2[0] - 1, temp_vertex_3[0] - 1));

        // add texture coordinates flopping x and y coordinates
        // For each point, we want the texture coordinates
        geometries[geometries.length - 1].faceVertexUvs[0].push([
          new THREE.Vector2(vt[temp_vertex_1[0] - 1][1], vt[temp_vertex_1[0] - 1][0]),
          new THREE.Vector2(vt[temp_vertex_2[0] - 1][1], vt[temp_vertex_2[0] - 1][0]),
          new THREE.Vector2(vt[temp_vertex_3[0] - 1][1], vt[temp_vertex_3[0] - 1][0])
        ]);
      }
    }
    // getting texture names from the obj file
    else if (objFileContents.vectors[o][0] == "usemtl") {

      //a new texture means a new geometry
      geometries.push(new THREE.Geometry());

      //must add vertices to each geometry because faces share them
      //optimization: make it such that we do no add duplicate-verticies
      geometries[geometries.length - 1].vertices = all_vertices;

      if (!has_textures) {
        // SLOW FILE
        switch (objFileContents.vectors[o][1]) {
          case 'GLASS_1':
          case 'FILLIN_GLASS_1':
            image_materials.push(new THREE.MeshPhongMaterial({
              transparent: true,
              opacity: 0.3,
              color: 0x00FFFF,
              side: THREE.DoubleSide
            }));
            break;
          case 'floor':
            image_materials.push(new THREE.MeshBasicMaterial({
              color: 0xcecece,
              visible: true
            }));
            break;
          case 'furniture':
            image_materials.push(new THREE.MeshPhongMaterial({
              color: 0xFFA500,
              visible: true
            }));
            break;
          case 'EXTRA_floor':
            image_materials.push(new THREE.MeshBasicMaterial({
              color: 0x000000,
              wireframe: false
            }));
            break;
          case 'FILLIN_ceiling':
            image_materials.push(new THREE.MeshBasicMaterial({
              color: 0xcecece,
              wireframe: false
            }));
            ceiling = image_materials[image_materials.length - 1];
            break;
          case 'EXTRA_wall':
            // image_materials.push(new THREE.MeshLambertMaterial({transparent:true,opacity: 0.5, color: 0xCC0000, side: THREE.FrontSide, wireframe:false}));
            image_materials.push(new THREE.MeshLambertMaterial({
              transparent: true,
              opacity: 0.4,
              color: 0xcecece,
              side: THREE.FrontSide
            }));
            break;
          default: // walls_<num>
            image_materials.push(new THREE.MeshPhongMaterial({
              color: 0xcecece,
              side: THREE.FrontSide,
              wireframe: false
            }));
            break;
        }
      } else {
        // TWEEN FILE
        if (objFileContents.vectors[o][1] == "EXTRA_wall_top") {
          image_materials.push(new THREE.MeshBasicMaterial({
            color: 0xCC0000
          }));
        } else {
          //get file from other folder
          //image_names.push("../textures/exact_geometry_photos/surface_camera_" + objFileContents.vectors[o][1] + "_texture.png");
          image_names.push(path + "surface_camera_" + objFileContents.vectors[o][1] + "_texture.png");

          //create a material out of the loaded image
          image_textures.push(THREE.ImageUtils.loadTexture(image_names[image_names.length - 1]));
          image_materials.push(new THREE.MeshBasicMaterial({
            side: THREE.FrontSide,
            map: image_textures[image_textures.length - 1]
          }));

          // Experimental ___________________________________________________________
          // var imageUrl = image_names[image_names.length - 1];
          // // last image added
          // $.ajax({
          //   type: "POST",
          //   url: "../php/image_exist.php",
          //   data: { image: imageUrl },
          //   async: false,
          //   success: function(e) {
          //   var json = JSON.parse(e);
          //   var bool_str = json.data;
          //   if(bool_str == "true") {
          //     image_textures.push(THREE.ImageUtils.loadTexture(image_names[image_names.length - 1]));
          //     image_materials.push(new THREE.MeshBasicMaterial( { side: THREE.FrontSide, map: image_textures[image_textures.length - 1] }));
          //   }
          //   }
          // });
          // Experimental ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


        }
      }
    }
  }

  // loop through all the geometrices and compute properities
  for (var loop = 0; loop < geometries.length; loop++) {
    // Compututing for lighting values
    geometries[loop].computeCentroids();
    geometries[loop].computeFaceNormals();

    if (obj_format == "redundent") // aka the tween obj (incomplete)
    {
      // console.log("ran compute vertex normals");
      geometries[loop].computeVertexNormals();
    }
  }
}

function imageExists(url, callback) {
  var img = new Image();
  img.onload = function() {
    callback(true);
  };
  img.onerror = function() {
    callback(false);
  };
  img.src = url;
}

// Sample usage
// var imageUrl = 'http://www.google.com/images/srpr/nav_logo14.png';
// imageExists(imageUrl, function(exists) {
//   console.log('RESULT: url=' + imageUrl + ', exists=' + exists);
// });


//==============================================================================
// FUNCTIONS RUN EVERY FRAME
//==============================================================================
function animate() {
  requestAnimationFrame(animate);
  render();
}

var first_run = true;

function render() {
  renderer.render(scene, camera);
}

//==============================================================================
// Mouse interaction functions
//==============================================================================

//These two functions keep the right click menu from coming up
//http://stackoverflow.com/questions/6789843/disable-right-click-menu-in-chrome
function mouseDown(e) {
  if (e.which == 3) { //righClick
  }
}

function RightMouseDown() {
  return false;
}

function onDocumentMouseDown(event) {

  var container_off = $('#container').offset();
  var container_h = $('#container').height();
  var container_w = $('#container').width();

  var rel_x = event.clientX - container_off.left;
  var rel_y = event.clientY - container_off.top;

  // console.log("Rel: " + rel_x + " " + rel_y );

  // Outside of our target area
  if (rel_x < 0 || rel_y < 0 || rel_x > container_w || rel_y > container_h) {
    return;
  }


  switch (event.button) {
    case 0:

      if (event.ctrlKey || event.shiftKey || event.altKey) {

        // console.log("On Document Mouse Down Case 2: Right button");
        event.preventDefault();

        document.addEventListener('mousemove', onDocumentMouseMoveTranslate, false);
        document.addEventListener('mouseup', onDocumentMouseUpTranslate, false);
        document.addEventListener('mouseout', onDocumentMouseOutTranslate, false);

        mouseXOnMouseDown = event.clientX;
        targetTranslationOnMouseDownX = targetTranslationX;
        mouseYOnMouseDown = event.clientY;
        targetTranslationOnMouseDownY = targetTranslationY;

      } else {


        // console.log("On Document Mouse Down Case 0: Left button");
        event.preventDefault();

        document.addEventListener('mousemove', onDocumentMouseMoveRotate, false);
        document.addEventListener('mouseup', onDocumentMouseUpRotate, false);
        document.addEventListener('mouseout', onDocumentMouseOutRotate, false);

        mouseXOnMouseDown = event.clientX;
        targetRotationOnMouseDownX = targetRotationX;

        mouseYOnMouseDown = event.clientY;
        targetRotationOnMouseDownY = targetRotationY;
      }

      break;

    case 1:

      /*
      // console.log("On Document Mouse Down Case 1: Middle button");
      event.preventDefault();

      document.addEventListener('mousemove', onDocumentMouseMoveZoom, false);
      document.addEventListener('mouseup', onDocumentMouseUpZoom, false);
      document.addEventListener('mouseout', onDocumentMouseOutZoom, false);

      mouseYOnMouseDown = event.clientY;
      targetZoomOnMouseDownY = targetZoomY;
      */

      break;
    case 2:

      //These two statements keep the right click menu from coming up. (call other functions)
      document.oncontextmenu = RightMouseDown;
      document.onmousedown = mouseDown;

      // console.log("On Document Mouse Down Case 2: Right button");
      event.preventDefault();

      document.addEventListener('mousemove', onDocumentMouseMoveTranslate, false);
      document.addEventListener('mouseup', onDocumentMouseUpTranslate, false);
      document.addEventListener('mouseout', onDocumentMouseOutTranslate, false);

      mouseXOnMouseDown = event.clientX;
      targetTranslationOnMouseDownX = targetTranslationX;
      mouseYOnMouseDown = event.clientY;
      targetTranslationOnMouseDownY = targetTranslationY;


      break;
  }
}

function onDocumentMouseMoveRotate(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  targetRotationX = targetRotationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.005;
  targetRotationY = targetRotationOnMouseDownY - (mouseY - mouseYOnMouseDown) * 0.005;
}

function onDocumentMouseMoveTranslate(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  //targetTranslationX = targetTranslationOnMouseDownX + (mouseX - mouseXOnMouseDown) * 0.02;
  targetTranslationY = targetTranslationOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.3;
}

function onDocumentMouseMoveZoom(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
  targetZoomY = targetZoomOnMouseDownY + (mouseY - mouseYOnMouseDown) * 0.1;
}


function onDocumentMouseUpRotate(event) {
  document.removeEventListener('mousemove', onDocumentMouseMoveRotate, false);
  document.removeEventListener('mouseup', onDocumentMouseUpRotate, false);
  document.removeEventListener('mouseout', onDocumentMouseOutRotate, false);
}

function onDocumentMouseUpTranslate(event) {
  document.removeEventListener('mousemove', onDocumentMouseMoveTranslate, false);
  document.removeEventListener('mouseup', onDocumentMouseUpTranslate, false);
  document.removeEventListener('mouseout', onDocumentMouseOutTranslate, false);
}

function onDocumentMouseUpZoom(event) {
  document.removeEventListener('mousemove', onDocumentMouseMoveZoom, false);
  document.removeEventListener('mouseup', onDocumentMouseUpZoom, false);
  document.removeEventListener('mouseout', onDocumentMouseOutZoom, false);
}

function onDocumentMouseOutRotate(event) {
  document.removeEventListener('mousemove', onDocumentMouseMoveRotate, false);
  document.removeEventListener('mouseup', onDocumentMouseUpRotate, false);
  document.removeEventListener('mouseout', onDocumentMouseOutRotate, false);
}

function onDocumentMouseOutTranslate(event) {
  document.removeEventListener('mousemove', onDocumentMouseMoveTranslate, false);
  document.removeEventListener('mouseup', onDocumentMouseUpTranslate, false);
  document.removeEventListener('mouseout', onDocumentMouseOutTranslate, false);
}

function onDocumentMouseOutZoom(event) {
  document.removeEventListener('mousemove', onDocumentMouseMoveZoom, false);
  document.removeEventListener('mouseup', onDocumentMouseUpZoom, false);
  document.removeEventListener('mouseout', onDocumentMouseOutZoom, false);
}

function onDocumentTouchStart(event) {}

function onDocumentTouchMove(event) {}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {

  //keyboard controls
  if (keyboard.pressed("up")) {
    targetTranslationZ -= .1;
  }
  if (keyboard.pressed("down")) {
    targetTranslationZ += .1;
  }
  if (keyboard.pressed("left")) {
    targetTranslationX -= .1;
  }
  if (keyboard.pressed("right")) {
    targetTranslationX += .1;
  }
  //apply rotation
  //use oposite target rotation because we want to rotate around axis perpendicular to mouse movement
  for (var m = 0; m < mesh.length; m++) {
    mesh[m].rotation.y = (targetRotationX);
    mesh[m].rotation.x = (targetRotationY);
  }

  //apply translation
  for (var m = 0; m < mesh.length; m++) {
    mesh[m].position.y = (targetTranslationY);
    mesh[m].position.x = (targetTranslationX);
    mesh[m].position.z = (targetTranslationZ);
    //  console.log("Target Translation Y " + targetTranslationY + " Mesh position y: " + mesh[m].position.y);
  }

  camera.position.z = targetZoomY;

  renderer.render(scene, camera);
}