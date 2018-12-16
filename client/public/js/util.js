/* Button that should load a blank table and render open */
function loadBlankModel() {
//  document.location.href = "/pages/draw_room.php";
  
}

function hideRenderingCanvas() {
  document.getElementById('canvas').style.display = 'none';
}


/* Disables the enter key for text fields */
function disable_enter() {
  document.onkeypress = stopRKey; 
}

/* used by disable_enter */
function stopRKey(evt) { 
  var evt = (evt) ? evt : ((event) ? event : null); 
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;} 
} 


/* closes the info box */
function close_info() { 
  document.getElementById('info').style.display = 'none'; 
} 

/* opens the info box */
function open_info() {
  document.getElementById('info').style.display = 'inline'; 
}

function open_commentbox() {
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('commentbox').style.display = 'inline';

}

function close_commentbox() {
  document.getElementById('commentbox').style.display = 'none';
}

/* Just opens the modeled failed box*/
function open_failed_box() { 
  document.getElementById('canvas').style.display = 'none'; 
  document.getElementById('model_failed').style.display = 'inline'; 
} 

/* Just closes the model failed box */
function close_failed_box() { 
  document.getElementById('model_failed').style.display = 'none'; 
  document.getElementById('canvas').style.display = 'inline'; 
} 

/* Just opens the modeled failed box*/
function open_lsvo_failed_box() { 
  document.getElementById('lsvo_failed').style.display = 'inline'; 
} 

/* Just closes the model failed box */
function close_lsvo_failed_box() { 
  document.getElementById('lsvo_failed').style.display = 'none'; 
} 
/* opens the loading screen */
function show_spinner() {

  document.getElementById('curtain').style.display = 'inline';
  document.getElementById('spinner').style.display = 'inline';

}

/* closes the loading screen */
function hide_spinner() {
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('curtain').style.display = 'none';
}

/* this disables enter in text boxes */
function disable_enter(text_id) {
  $(text_id).keypress(function(event) {
  if(event.keyCode == 13) {
    event.preventDefault();
  }
  });
}

/* checks if a file exisit or not*/
function doesFileExist(urlToFile)
{
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', urlToFile, false);
  xhr.send();
   
  if (xhr.status == "404") {
    return false;
  } else {
    return true;
  }
}//exisit


/* function returns the number of windows that are in the scene */
function active_window_num(ftWindowArray) {
  var count = 0;
  for(var i = 0; i < ftWindowArray.length; i++) {
  var curWin = ftWindowArray[i];
  if( curWin.idPair != null ) {
    count = count + 1;
  }
  }
  return count;
}

/* Event handler for logout button*/
function logout_pressed() {
  
  if(confirm("Are you sure you want to log out?")) {
  $.post("../php/redirect.php", {logout: true}, function callback() {
      window.location.href = "../index.html"; });

  }//if

}//lgout

/* this function redirects you to loading page but first clears
 * the users folders */
function loading_page_pressed() {

  if(confirm("Notice: models not build will be lost. Continue?")) {
  $.post("../php/redirect.php", {logout:false}, function callback() {
      window.location.href = "../pages/loading_page.php"; });
  }//if

}
/* used by gen wall data to put '+' on things */
function toStr(num) { 
  if (num > 0) {
    return "+" + num; 
  }else{
    return num;
  }
}//tostr

/* used by gen wall data to see if a wall is on the table*/
function isWallValid(table, uL,uR,lR,lL) { 
  return onTable(table, uL[0],uL[1]) && 
       onTable(table, uR[0],uR[1]) && 
       onTable(table, lR[0],lR[1]) && 
       onTable(table, lL[0],lL[1]); 
}//isvld

/* used to get centerpoint of a wall */
function centerPoint(point) {
  TABLE = 1.0668; //42 inches
  
  scale = TABLE/(table.attr('r')*2);
  centeredPoint = Array();    
  x = point[0];
  y = point[1];
  cx = table.attr('cx');
  cy = table.attr('cy');
  
  
  centeredPoint[0] = Math.round(10000*(cx - x)*scale)/10000;
  centeredPoint[1] = Math.round(10000*(cy - y)*scale)/10000;

  // finding these bugs are super required
  if( isNaN(centerPoint[0]) || isNaN(centerPoint[1]) ) {
    //console.log("NaN bug found");
    // window.location = "../pages/login_page.php";
  }

  return centeredPoint;
} 

/* Conversions used by genwalldata */
function inch2meter(num) {return num/39.3701;}
function meter2inches(num) { return num*39.3701;} 
function getHeight(num) { return Math.round(10000*inch2meter(num))/10000; }

function initTimerConditional(time_start) {

  if(time_start == 0) {
  }

}

function metersToPixels(num) {
  f = num/0.3048; //meters to feet
  t = f * 0.0254; //feet to table units
  return t*(table.attr('r')*2)/1.0668;
}

//===============================================
//  Sketching Utils
//===============================================

/* This function return if something is within this range */
function inRange(num,a,b) {
  return (a <= num && num <= b);
}

/* This function looks for user trans data and loads it*/
function loadTransData(path,ftWallArray,ftWindowArray,ftNorth,table) {

  // Read from file given
  objFileContents.fetch(path);
  objFileContents.parse();

  // Get the old screen size
  var old_width  = Number(objFileContents.vectors[0][1]);
  var old_height = Number(objFileContents.vectors[0][2]);
  var new_width  = window.innerWidth;
  var new_height = window.innerHeight;
  
  // Get the hour and month and time
  var old_month   = Number(objFileContents.vectors[1][1]);
  var old_hour  = Number(objFileContents.vectors[2][1]);
  var old_time  = Number(objFileContents.vectors[3][1]);

  // Change month and hour to old values
  setMonth(old_month);
  setHour(old_hour);

  //// Change compass to old value
  var compass_angle  = Number(objFileContents.vectors[4][1]);

  compass_angle    = Math.round(compass_angle);
  ftNorth.attrs.rotate =  compass_angle;
  ftNorth.apply();

  // Start reading in walls
  var scan_line = 5;

  // DEBUG
  for(var i = 0; i < ftWallArray.length; i++) {

   var wall = ftWallArray[i];

   wall.idNumber       = Number(objFileContents.vectors[scan_line][1]);

   // Conversion
   var old_tx        = Number(objFileContents.vectors[scan_line][2]);
   var old_ty        = Number(objFileContents.vectors[scan_line][3]);
   var old_sx        = Number(objFileContents.vectors[scan_line][4]);
   var old_sy        = Number(objFileContents.vectors[scan_line][5]);

   if(inRange(old_tx,0,1) && inRange(old_ty,0,1)) {

     // Set from relative to new absolute
     var rel_x_cir = old_tx;
     var rel_y_cir = old_ty;
     
     var abs_x_cir = rel_x_cir * table.attr('r') * 2;
     var abs_y_cir = rel_y_cir * table.attr('r') * 2;

     var box_x = table.attr('cx') - table.attr('r');
     var box_y = table.attr('cy') - table.attr('r');

     var abs_x = abs_x_cir + box_x;
     var abs_y = abs_y_cir + box_y;

     var trans_x = abs_x - wall.subject.attr('x');
     var trans_y = abs_y - wall.subject.attr('y');

     wall.attrs.translate.x = trans_x;
     wall.attrs.translate.y = trans_y;

     wall.apply();
     
     // Other attrabutes

     wall.attrs.scale.x = old_sx;
     wall.attrs.scale.y = old_sy;

     wall.attrs.rotate = Number(objFileContents.vectors[scan_line][6]);
     wall.idPairArray  = new Array();

     // DEBUG

     // Curved wall
     if(objFileContents.vectors[scan_line][7] == "curved") {
     wall.isCurved = true;
     }else{
     wall.isCurved = false;

     }
   }

   // apply
   wall.apply();
   // up scanline
   scan_line += 1;

  }// Walls
 
  // For each Window move it according
  for(var i = 0; i < ftWindowArray.length; i++) {

   var win = ftWindowArray[i];
   win.idNumber      = Number(objFileContents.vectors[scan_line][1]);

   // Conversion
   var old_tx        = Number(objFileContents.vectors[scan_line][2]);
   var old_ty        = Number(objFileContents.vectors[scan_line][3]);
   var old_sx        = Number(objFileContents.vectors[scan_line][4]);
   var old_sy        = Number(objFileContents.vectors[scan_line][5]);

   if(inRange(old_tx,0,1) && inRange(old_ty,0,1)) {
   var rel_x_cir = old_tx;
   var rel_y_cir = old_ty;
   
   var abs_x_cir = rel_x_cir * table.attr('r') * 2;
   var abs_y_cir = rel_y_cir * table.attr('r') * 2;

   var box_x = table.attr('cx') - table.attr('r');
   var box_y = table.attr('cy') - table.attr('r');

   var abs_x = abs_x_cir + box_x;
   var abs_y = abs_y_cir + box_y;

   var trans_x = abs_x - win.subject.attr('x');
   var trans_y = abs_y - win.subject.attr('y');

   win.attrs.translate.x = trans_x;
   win.attrs.translate.y = trans_y;

   win.apply();

   win.attrs.scale.x = old_sx;

   win.attrs.rotate     = Number(objFileContents.vectors[scan_line][6]);
   var id          = objFileContents.vectors[scan_line][7];
   if(id != "null") {
     win.idPair = Number(id);
     ftWallArray[win.idPair].idPairArray.push(win.idNumber);
   }else{
     win.idPair = null;
   }
   // apply
   win.apply();
   }//if
   // up scanline
   scan_line += 1;
  }//win
}//loadtrans

/* generateTranData */
function generateTransData(ftWallArray,ftWindowArray, ftNorth, table, INITAL_VIEW_SIZE_W, INITAL_VIEW_SIZE_H, time_start) {
  // Takes in the ftWallArray;
  result_str = "";

  // screen_width screen_height
  result_str += "viewport " + INITAL_VIEW_SIZE_W.toString() + " " 
  + INITAL_VIEW_SIZE_H.toString() + "\n";

  // save month and time
  result_str += "month "  + extractMonth() + "\n";
  result_str += "hour "   + extractHour() + "\n";
  result_str += "time_start " + time_start + "\n" ;

  // for the compass rotation
  result_str += "compass_rotation " + ftNorth.attrs.rotate + "\n";

  // For each wall
  // wall init_x init_y trans_x trans_y scale_x scale_y rot pair
  for(var i = 0; i < ftWallArray.length; i++) {

   var wall = ftWallArray[i];

   var id = wall.idNumber.toString();

   // Convert into relative postions ////////
   var abs_x = wall.attrs.translate.x + wall.subject.attr('x');
   var abs_y = wall.attrs.translate.y + wall.subject.attr('y');

   var box_x = table.attr('cx') - table.attr('r');
   var box_y = table.attr('cy') - table.attr('r');

   var abs_x_cir = abs_x - box_x;
   var abs_y_cir = abs_y - box_y;

   var rel_x_cir = abs_x_cir / (2*table.attr('r'));
   var rel_y_cir = abs_y_cir / (2*table.attr('r'));
  

   // Adding it into the file
   var trans_x = rel_x_cir.toString();
   var trans_y = rel_y_cir.toString();

   var scale_x = wall.attrs.scale.x.toString();
   var scale_y = wall.attrs.scale.y.toString();
   var rot   = wall.attrs.rotate.toString();

   if(wall.isCurved) {
   result_str += "wall" + " " + id + " " + trans_x + " " + trans_y + " "
   + scale_x + " " + scale_y + " " + rot + " curved\n";

   }else{
   result_str += "wall" + " " + id + " " + trans_x + " " + trans_y + " "
   + scale_x + " " + scale_y + " " + rot + " not_curved\n";

   }

  }


  // For each window
  // window init_x init_y trans_x trans_y scale_x scale_y rot pair
  for(var i = 0; i < ftWindowArray.length; i++) {

   var win = ftWindowArray[i];

   var id =    win.idNumber.toString();

   // Convert into relative postions ////////
   var abs_x = win.attrs.translate.x + win.subject.attr('x');
   var abs_y = win.attrs.translate.y + win.subject.attr('y');

   var box_x = table.attr('cx') - table.attr('r');
   var box_y = table.attr('cy') - table.attr('r');

   var abs_x_cir = abs_x - box_x;
   var abs_y_cir = abs_y - box_y;

   var rel_x_cir = abs_x_cir / (2*table.attr('r'));
   var rel_y_cir = abs_y_cir / (2*table.attr('r'));

   var trans_x = rel_x_cir.toString();
   var trans_y = rel_y_cir.toString();
   var scale_x = win.attrs.scale.x.toString();
   var scale_y = win.attrs.scale.y.toString();
   var rot   = win.attrs.rotate.toString();
   var pair  = "";
   if(win.idPair == null) {
   pair = "null";
   }else{
   pair = win.idPair.toString();
   }

   result_str += "win" + " " + id +" " + trans_x + " " + trans_y + " "
   + scale_x + " " + scale_y + " " + rot + " " + pair + "\n";

  }


  // done
  result_str += "end";

  return result_str;
}//genTrans

/* generateWallData  */
function generateWallData(ftWallArray, ftWindowArray, ftNorth, table) {

  var log = "";
  log += "north " + toStr(toCompassRadians(ftNorth.attrs.rotate)) + "\n";
  log += "floor_material   1.000 1.000 1.000\n";
  log += "ceiling_material 1.000 1.000 1.000\n";
  log += "wall_material  1.000 1.000 1.000\n";
  log += "table 0.000000 0.000000 0.000000 0.537077\n";

  var logWall = "";

  for (var i= 0; i < ftWallArray.length; i++) {
  
    var wall = ftWallArray[i],
    x = (wall.attrs.x + wall.attrs.translate.x),
    y = (wall.attrs.y + wall.attrs.translate.y),
    w = wall.attrs.size.x*wall.attrs.scale.x,
    h = wall.attrs.size.y*wall.attrs.scale.y,
    a = wall.attrs.rotate;
    var radius_inner;
    var radius_outer;



    // Initate
    var uL = new Array(); var uR = new Array(); var lR = new Array(); var lL = new Array();    

    if(wall.isCurved == false) {

      // get the 4 corner of a a wall/window
      uL = upperLeftCorner( x,y,w,h,a,wall);
      uR = upperRightCorner(x,y,w,h,a,wall);
      lR = lowerRightCorner(x,y,w,h,a,wall);
      lL = lowerLeftCorner( x,y,w,h,a,wall);

    }else{

      // FIXME make this into a nice function
      // get midpoint
      var mid = getMidpoint(wall);
      var x_mid = mid[0]; var y_mid = mid[1]; 

      //  get pos_x and pos_y (upper left)
      var angle_center_uL = (toRadians(a) + (3 * Math.PI /4));
      var angle_center_uR = (toRadians(a) + (1 * Math.PI /4));
      var angle_center_lR = (toRadians(a) + (7 * Math.PI /4));
      var angle_center_lL = (toRadians(a) + (5 * Math.PI /4));


      uL[0] = x_mid + w/2.0 *1.41421356237 * Math.cos(angle_center_uL);
      uL[1] = y_mid - h/2.0 *1.41421356237 * Math.sin(angle_center_uL);

      uR[0] = x_mid + w/2.0 *1.41421356237 * Math.cos(angle_center_uR);
      uR[1] = y_mid - h/2.0 *1.41421356237 * Math.sin(angle_center_uR);

      lR[0] = uL[0]; // We do not need to check if this is included
      lR[1] = uL[1];

      lL[0] = x_mid + w/2.0 *1.41421356237 * Math.cos(angle_center_lL);
      lL[1] = y_mid - h/2.0 *1.41421356237 * Math.sin(angle_center_lL);

      // Finding readius for curved wall
      var p1 = centerPoint(lL); 
      var p2 = centerPoint(lR);
      
      radius_outer = Math.sqrt( Math.pow(p1[0]-p2[0],2) + Math.pow(p1[1]-p2[1],2) ) ;
      radius_inner  = radius_outer - 0.0127/2.0;

      // left_paper.circle(uL[0],uL[1],5).attr({fill:"black"});
      // left_paper.circle(uR[0],uR[1],5).attr({fill:"green"});
      // left_paper.circle(lR[0],lR[1],5).attr({fill:"blue"});
      // left_paper.circle(lL[0],lL[1],5).attr({fill:"red"});

    }
    
    if(isWallValid(table,uL,uR,lR,lL) && wall.subject.attr('opacity') > 0) {

      number_of_walls += 1;    // Update global

      // logWall  += "wall_material  1.000 1.000 1.000\n"; // <------------- To make audiolious material

      if(wall.isCurved == false) {

        // convert relative to center of the table
        uL = centerPoint(uL);
        uR = centerPoint(uR);
        lR = centerPoint(lR);
        lL = centerPoint(lL);

        // Print out the values that a wall file understands
        logWall += "wall  ";
        logWall += toStr(uL[0]) + "  " + toStr(uL[1]) + "  ";
        logWall += toStr(uR[0]) + "  " + toStr(uR[1]) + "  ";
        logWall += toStr(lR[0]) + "  " + toStr(lR[1]) + "  ";
        logWall += toStr(lL[0]) + "  " + toStr(lL[1]) + "  ";

        //Addtional Walls  Types
        
        var wall_color = wall.subject.attr('fill');
        
        if(wall_color == "green") {
        logWall += toStr(getHeight(5)) + "\n";

        }else if(wall_color == "blue") {
        logWall += toStr(getHeight(8)) + "\n";

        }else if(wall_color == "red") {
        logWall += toStr(getHeight(10)) + "\n";
        
        }

      }else{
        
        // GOAL ________________________________________________________________
        // Print out the curved wall values
        // curved_wall <pos_x> <pos_y> <radius_in> <radius_out> <tetha> <tetha> 0
        // =====================================================================


        // get midpoint
        var mid = getMidpoint(wall);
        var x_mid = mid[0]; var y_mid = mid[1]; 

        //  get pos_x and pos_y (upper left)
        var angle_center = (toRadians(a) + (3 * Math.PI /4)) % (2*Math.PI);

        var pos_x = x_mid + w/2.0 *1.41421356237 * Math.cos(angle_center);
        var pos_y = y_mid - h/2.0 * 1.41421356237 *  Math.sin(angle_center);

        // get the inner and out radius in table coorintae 
        var pos = new Array(pos_x,pos_y); 
        pos = centerPoint(pos); 
        mid = centerPoint(mid);

        // Defined above
        // var radius_inner = Math.sqrt( Math.pow(pos[0]-mid[0],2) + Math.pow(pos[1]-mid[1],2) ) + 0.0127/2.0;;
        // var radius_outer = radius_inner + 0.0127/2.0; // half an inch more

        // get the angle to print out
        var angle_start = (-1*toRadians(a) + (4 * Math.PI /4)) % (2*Math.PI);

        var angle_end   = angle_start + (Math.PI / 2);

        if( angle_end >  2*Math.PI ) {
        angle_start -= 2*Math.PI;
        angle_end = angle_end % (2 * Math.PI);
        }


        var wall_height;

        if(wall.subject.attr('src') == "../images/curved_wall_green.png") {

        wall_height = toStr(getHeight(5));

        }else if(wall.subject.attr('src') == "../images/curved_wall_blue.png") {

        wall_height = toStr(getHeight(8));

        }else if(wall.subject.attr('src') == "../images/curved_wall_red.png") {

        wall_height = toStr(getHeight(10));

        }else{
        alert("Error, cannot find curved_wall_<color>");
        }


        // Setting up

        logWall += "curved_wall   ";

        logWall += toStr(pos[0]) + "  " +  toStr(pos[1]) + "  ";
        logWall += toStr(round_output(radius_inner)) + "  " + toStr(round_output(radius_outer)) + "  ";
        logWall += toStr(round_output(angle_start)) + "  " + toStr(round_output(angle_end)) + "  ";
        logWall += wall_height + " 0\n"; //<------- what the hell does this do _ this is the hight of the walls

      }
        

      if(wall.idPairArray.length != 0) {
       
        for(var j = 0; j < wall.idPairArray.length; j++) {

          number_of_windows += 1;   // Update global

          var curWin = ftWindowArray[wall.idPairArray[j]];

          x = curWin.attrs.x + curWin.attrs.translate.x,
          y = curWin.attrs.y + curWin.attrs.translate.y,
          w = curWin.attrs.size.x * curWin.attrs.scale.x,
          h = curWin.attrs.size.y,
          a = curWin.attrs.rotate;

          var uL = upperLeftCorner( x,y,w,h,a,curWin);
          var uR = upperRightCorner(x,y,w,h,a,curWin);
          var lR = lowerRightCorner(x,y,w,h,a,curWin);
          var lL = lowerLeftCorner( x,y,w,h,a,curWin);

          uL = centerPoint(uL);
          uR = centerPoint(uR);
          lR = centerPoint(lR);
          lL = centerPoint(lL);
          
          //console.log(uL[0] + " " + uL[1]);
          logWall += "window  ";
          logWall += toStr(uL[0]) + "  " + toStr(uL[1]) + "  ";
          logWall += toStr(uR[0]) + "  " + toStr(uR[1]) + "  ";
          logWall += toStr(lR[0]) + "  " + toStr(lR[1]) + "  ";
          logWall += toStr(lL[0]) + "  " + toStr(lL[1]) + "  ";
          logWall += "cyan\n";

        }
      }
    }
  }

log += logWall;

return log;


}//genWall



function round_output(number) {

  number = number * 10000;
  number = Math.ceil(number);
  number = number / 10000;

  return number;

}


/* Used to just get month on UI */
function extractMonth() {

  var month_selector = document.getElementById("month");
  var month = Number(month_selector.options[month_selector.selectedIndex].value);
  return month;

}

/* Used to set the month on the scroll thingy*/
function setMonth(num) {

  var month_selector = document.getElementById("month");
  month_selector.selectedIndex = num -1;
}

/* Used to set the hour on the scroll thingy*/
function setHour(num) {

  var time_selector = document.getElementById("time");
  time_selector.selectedIndex = num;

}
/* Used to just get hour on UI */
function extractHour() {

  var time_selector = document.getElementById("time");
  var hour = Number(time_selector.options[time_selector.selectedIndex].value); 
  return hour;

}

/* Used to pick a valid time */
function valid_time(hour) {
   return (0 <= hour && hour <= 5) || ( 21 <= hour && hour <= 23)
}

function clear_sketch(wallArray, winArray) {

  // Return walls to normal locations
  for(var i = 0; i < wallArray.length; i++) {
  var element = wallArray[i];

  element.attrs.translate.x = 0;
  element.attrs.translate.y = 0;
  element.attrs.scale.x = 1;
  element.attrs.scale.y = 1;
  element.attrs.rotate = 0;
  element.idPairArray = new Array();
  element.hideHandles({ undrag:false });
  element.apply();
  }

  // return windows to normal loctatoins
  for(var i = 0; i < winArray.length; i++) {
  var element = winArray[i];

    element.attrs.translate.x = 0;
    element.attrs.translate.y = 0;
    element.attrs.scale.x = 1;
    element.attrs.scale.y = 1;
    element.attrs.rotate = 0;
    element.idPair = null;
    element.hideHandles({ undrag:false });
    element.apply();
  }

  //Reset month
  var month_selector = document.getElementById("month");
  var time_selector = document.getElementById("time");
  
  month_selector.selectedIndex =  0;
  time_selector.selectedIndex  =  12;

  // Reset compass directions
  ftNorth.attrs.rotate  = -90;
  ftNorth.apply();
  positionNorthSouth(table,ftNorth,compass_label_n, compass_label_s);
  
  //FIXME I will fail if the user resizes the window after a  new model
  //TODO  Force me clear those folders / track new or not

}//clear

function upperLeftCornerCurved(x,y,w,h,dx,dy,angle,ftObj) { 
  // where i will store my result
  var coor = new Array();


  // startpoint
  var x_start = x + dx/2;
  var y_start = y + dy/2;
  
  // get the midpoint
  var x_mid = x_start + (x_start + w);
  var y_mid = y_start + (y_start + h);




}

function upperRightCorner(x,y,w,h,angle,ftObj) {
  var coor = new Array();
  

  angle = to_ft_radians(angle);
  var angle_off = Math.atan(h/w);
  var distance = (Math.sqrt(Math.pow(w,2) +Math.pow(h,2)))/2;
  var angle_rel = angle + angle_off;
  var relPoint = toRect(distance,angle_rel);
   
  var cx = ftObj.attrs.center.x + ftObj.attrs.translate.x;
  var cy = ftObj.attrs.center.y + ftObj.attrs.translate.y;
  
  coor[0] = cx + relPoint[0];
  coor[1] = cy + relPoint[1];
  
  return coor;
}
 function lowerRightCorner(x,y,w,h,angle,ftObj) {
  var coor = new Array();

  if(ftObj.isCurved) {

  }
  
  angle = to_ft_radians(angle);
  var angle_off = Math.atan(-h/w);
  var distance = (Math.sqrt(Math.pow(w,2) +Math.pow(h,2)))/2;
  var angle_rel = angle + angle_off;
  var relPoint = toRect(distance,angle_rel);
   
  
  var cx = ftObj.attrs.center.x + ftObj.attrs.translate.x;
  var cy = ftObj.attrs.center.y + ftObj.attrs.translate.y;
   
  coor[0] = cx + relPoint[0];
  coor[1] = cy + relPoint[1];
  
  return coor;
}

function upperLeftCorner(x,y,w,h,angle,ftObj) {
  var coor = new Array();
  
  if(ftObj.isCurved) {

  }

  // mindy
  angle = to_ft_radians(angle);
  var angle_off = Math.atan(-h/w);
  var distance = (Math.sqrt(Math.pow(w,2) +Math.pow(h,2)))/2;
  var angle_rel = angle + angle_off;
  var relPoint = toRect(distance,angle_rel);
   
  var cx = ftObj.attrs.center.x + ftObj.attrs.translate.x;
  var cy = ftObj.attrs.center.y + ftObj.attrs.translate.y;
  
  coor[0] = cx - relPoint[0];
  coor[1] = cy - relPoint[1];
  
  return coor;
}

function lowerLeftCorner(x,y,w,h,angle,ftObj) {
  var coor = new Array();
  
  if(ftObj.isCurved) {

  }

  angle = to_ft_radians(angle);
  var angle_off = Math.atan(h/w);
  var distance = (Math.sqrt(Math.pow(w,2) +Math.pow(h,2)))/2;
  var angle_rel = angle + angle_off;
  var relPoint = toRect(distance,angle_rel);
   
  var cx = ftObj.attrs.center.x + ftObj.attrs.translate.x;
  var cy = ftObj.attrs.center.y + ftObj.attrs.translate.y;
  
  coor[0] = cx - relPoint[0];
  coor[1] = cy - relPoint[1];
  
  return coor;
}

function toRect(dist,angle) {
  var point = new Array();
  point[0] = dist * Math.cos(angle);
  point[1] = dist * Math.sin(angle)*-1;
  return point;
}

/* onHandleSide */
function onHandleSide(ftWall, point) {

  var handle_x = ftWall.handles.x.disc.attrs.cx;
  var handle_y = ftWall.handles.x.disc.attrs.cy;

  var center_x = ftWall.attrs.center.x + ftWall.attrs.translate.x;
  var center_y = ftWall.attrs.center.y + ftWall.attrs.translate.y;

  if(center_x < handle_x) {
    if( center_x <= point.x && point.x < handle_x ) { return true; } else { return false; }
  }else if(center_x > handle_x) {
    if( handle_x <= point.x && point.x < center_x ) { return true; } else { return false; }
  }else{

    // Use Y to decide
    if(center_y < handle_y) {
      if( center_y <= point.y && point.y < handle_y ) { return true; } else { return false; }

    }else if(center_y > handle_y) {
      if( handle_y <= point.y && point.y < center_y ) { return true; } else { return false; }

    }else{
      return true; // done again
    }
  }
}

/* On Table */
function onTable(table,x,y) {
  cx = table.attr('cx');
  cy = table.attr('cy');
  rad = table.attr('r');
  distance = Math.sqrt(Math.pow(cx-x,2) + Math.pow(cy-y,2));
  return distance < rad;
}
/* Create spinner */
function generate_spinner() {

  // PAST LOAD
  var target = document.getElementById('spinner');
  var spinner = new Spinner({
  lines: 13, // The number of lines to draw
  length: 20, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
  }).spin(target);


}//spnr

/* Change Sam's size */
function updateSamWall(samWall, color) {

  if(color == 'green') {
  samWall.subject.attr({src:'../images/samWall_5ft.png'});

  }else if(color == 'blue') {
  samWall.subject.attr({src:'../images/samWall_8ft.png'});


  }else if(color == 'red') {
  samWall.subject.attr({src:'../images/samWall_10ft.png'});

  }else if(color == 'yellow') {
  samWall.subject.attr({src:'../images/samWindow.png'});

  }

}//updsam

/* Functions for scaling */
function xScale(x) {return x*(width/WIDTH_CANVAS)};
function yScale(y) {return y*(height/HEIGHT_CANVAS)};

/* Used to unselect all handles in the file execpt primitive */
function hideAllHandles(primitive,ftWallArray, ftWindowArray) {

  for(var i = 0; i < ftWallArray.length;i++) {
    if(primitive != ftWallArray[i]) {
    ftWallArray[i].hideHandles({undrag:false});
    }
  }

  for(var i = 0; i < ftWindowArray.length;i++) {
    if(primitive != ftWindowArray[i]) {
    ftWindowArray[i].hideHandles({undrag:false});
    }
  }

}// hidw

//Scaling functions
function inches2pixles(inches) {
  TABLE = 42// inches
  scale = (table.attr('r')*2)/TABLE;
  return inches*scale;
}

/* Create pause to wait for rescaling to finish */
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
  if (!uniqueId) {
  uniqueId = "Don't call this twice without a uniqueId";
  }
  if (timers[uniqueId]) {
  clearTimeout (timers[uniqueId]);
  }
  timers[uniqueId] = setTimeout(callback, ms);
  };
})();//wait

/* Resize function used to rescale things if users change viewport */
//$(window).resize(function() {
//  show_spinner();
//  waitForFinalEvent(function() {
//    location.reload();
//  });
//});//resize

/* used for window placement */
function Point (x,y) {
  this.x = x;
  this.y = y;
  this.getInfo = function() {
    return "Point { " + this.x + " ," + this.y + " } ";
  }

  this.distance = function(pt) {
    return Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2));
  }
}

/* used for window placement */
function Line ( pt, m) {
  this.pt = pt;
  this.m = m;

  this.getInfo = function() 
  {
    return "Line { " + this.pt.getInfo() + ", " + this.m + " } ";
  }

  this.eval = function(input) 
  {
    return this.m * ( input - this.pt.x ) + this.pt.y;
  }

  this.intersects = function(that)
  {

    var num = ( -1 * that.m * that.pt.x  + this.m * this.pt.x) + (that.pt.y - this.pt.y);
    var dem = (this.m - that.m);
    
    var intersect_x = num / dem;
    var intersect_y = this.eval(intersect_x);

    var intersects_pt = new Point(intersect_x, intersect_y);
    return intersects_pt;
  }
}


/* Used to move north and south label around table */
function positionNorthSouth(table,ftNorth,compass_label_n, compass_label_s) {

  var cx = table.attr('cx');
  var cy = table.attr('cy');
  var r = table.attr('r') * .90;
  var n_angle = -1*toRadians(Math.floor(ftNorth.attrs.rotate));

  var delta_x = Math.cos(n_angle) * r;
  var delta_y = Math.sin(n_angle) * r;

  var text_x_n = cx+delta_x;
  var text_y_n = cy+delta_y;

  var text_x_s = cx-delta_x;
  var text_y_s = cy-delta_y;

  compass_label_n.attr({x:text_x_n, y:text_y_n });
  compass_label_s.attr({x:text_x_s, y:text_y_s });

}


/* Reset Compass angle */
function resetCompass(table,ftNorth,compass_label_n, compass_label_s) {
  ftNorth.attrs.rotate = -90;
  ftNorth.apply();
  positionNorthSouth(table,ftNorth,compass_label_n, compass_label_s);

}

/* Used to convert to radians of freetrans objects */
function to_ft_radians (angle) {
  if(angle  < 0) {
    angle = Math.abs(angle);
  }else if(angle>0) {
    angle = 180 - angle;
    angle +=180;
  }
    
  angle =  angle * (Math.PI / 180);
  return Number((angle).toFixed(2));
}

/* Used to convert to radians for lsvo */
function toRadians (angle) {
  if(angle  < 0) {
    angle = angle * -1;
  }else if(angle > 0) {
    angle = 360 - angle;
  }else{

    return 0;

  }
  angle =  angle * (Math.PI / 180);
  return Number((angle).toFixed(2));
}

// /* Special because LSVO is weird */
// function toCompassRadians(angle) 
// {
//   angle -= ( 90 + 180 );
//   if(angle < -180) {
//     angle = angle + 360;
//   }
   
//   angle = ((angle)) * (Math.PI / 180);
//   return Number((angle).toFixed(3));
// }

function toCompassRadians(angle) 
{
  angle += 90+180;
  if(angle > 180) {
    angle = angle - 360;
  }
    
  angle = ((angle)) * (Math.PI / 180);
  return Number((angle).toFixed(3));
}

/* Converts to regular usage of angle */
function toCompass(angle) { return -1*angle; } 




function getMidpoint(wall) {

  var pt = new Array();

  var x = (wall.attrs.x + wall.attrs.translate.x);
  var y = (wall.attrs.y + wall.attrs.translate.y);
  var w = wall.attrs.size.x*wall.attrs.scale.x;
  var h = wall.attrs.size.y*wall.attrs.scale.y;
  var a = wall.attrs.rotate;
  var dx  = w - wall.attrs.size.x;
  var dy  = h - wall.attrs.size.y;

  // startpoint
  var x_start = x - dx/2; 
  var y_start = y - dy/2;

  // get the midpoint
  var x_mid = (x_start + (x_start + w))/2.0; 
  var y_mid = (y_start + (y_start + h))/2.0;

  pt[0] = x_mid;
  pt[1] = y_mid;

  return pt;

}

function negateVec(vec) {
  return [-1*vec[0], -1*vec[1]];
}

function pDistance(x, y, x1, y1, x2, y2) {
  // Joshua http://stackoverflow.com/users/368954/joshua

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
    param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
  xx = x1;
  yy = y1;
  }
  else if (param > 1) {
  xx = x2;
  yy = y2;
  }
  else {
  xx = x1 + param * C;
  yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;

  return Math.sqrt(dx * dx + dy * dy);

}
function getDistancePtOnLineSeg(pt,line_start,line_end) {

  var x = pt[0];
  var y = pt[1];

  var x1 =line_start[0];
  var y1 =line_start[1];

  var x2 = line_end[0];
  var y2 = line_end[1];

  return pDistance( x,y,x1,y1,x2,y2);

}
function getSlope(pt1, pt2) { 
  var a = (pt2[1] - pt1[1]) / (pt2[0] - pt1[0]);
  if(a>1000)
  return 1000;
  if(a<-1000)
  return -1000;
  if(a==0)
  return .0001;
  return a;
}

function extractPathPoints(path)
{

  // Extracts the start and end points in path object
  // Returns both of these points as an array

  //console.log(path);
  start_pt = [path.attr('path')[0][1], path.attr('path')[0][2]];
  end_pt = [path.attr('path')[1][1], path.attr('path')[1][2]];
  return [start_pt, end_pt];
}

function normalizeVector(vec)
{

  // Normalizes a 2D vector
  var mag = magVec(vec);

  return [vec[0] / mag, vec[1] / mag];
}


function convertLine2Vector(start, end)
{
  // This function will take in a start and end points and return a vector

  // Get the direction 
  var vec = [end[0] - start[0], end[1] - start[1]];

  // Normalize
  vec = normalizeVector(vec);

  return vec;
}

function dotVec(vec1, vec2)
{

  // Returns the dot product
  return vec1[0] * vec2[0] + vec1[1] * vec2[1];
}

function magVec(vec)
{

  return Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2));
}

function angleBtwVec(vec1, vec2)
{
  // Computes the angles between vectors
  return Math.acos(dotVec(vec1, vec2) / (magVec(vec1) * magVec(vec2)));
}

function perpendicularVec(vec) {
  return [  -vec[1] , vec[0] ];
}

// DEBUG DEBUG DEBUG
function line_intersection(m_1, pt1, m_2, pt2)
{

  //console.log("======================");
  //console.log('m_1', m_1, 'pt1', pt1);
  //console.log('m_2', m_2, 'pt2', pt2);

  var x_1 = pt1[0];
  var y_1 = pt1[1];

  var x_2 = pt2[0];
  var y_2 = pt2[1];

  var x = (-m_2 * x_2 + y_2 + m_1 * x_1 - y_1) / (m_1 - m_2);
  var y = m_1 * (x - x_1) + y_1;

  return [x, y];
}

function distancePts(a, b)
{
  return Math.sqrt(Math.pow((a[0] - b[0]),2) + Math.pow((a[1] - b[1]),2));
}

//checks if a point c is between 2 points a and b (Must be on the same line to maintain accuracy)
function inbetween(a, c, b)
{
  var eps = .01;
  var dist = distancePts(a,c) + distancePts(c,b);
  if((dist - distancePts(a,b)) < eps && (dist - distancePts(a,b)) > (eps*-1))
  {
  return true;
  }
  return false;
}

// oasis Code
