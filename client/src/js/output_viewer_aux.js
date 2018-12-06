// ============================================
// Debugging main function 
// ============================================

function main() {


  all_users = get_users_db();

  for(var i = 0; i < all_users.length; i++) {

  cur_username = all_users[i];

  user_div_id = "div_" + cur_username;
  create_user_div(user_div_id, cur_username);

  console.log("Running for cur_username:" + cur_username);

  all_models = get_models(cur_username);

  for(var j = 0; j < all_models.length; j++) {


    user_model_num  = all_models[j];
    model_div_id = "div_" + cur_username + "_" + user_model_num;
    create_model_div(model_div_id, user_div_id, cur_username,  user_model_num)

    all_renovations = get_renovations(cur_username, user_model_num);


    for(var k = 0; k < all_renovations.length; k++) {

    model_id = all_renovations[k];

    raphael_model_viwer(model_div_id, model_id, 200);


    }

  }

  }

}


function get_users_db()
{
  // returns a list of users from our database
  var user_list = new Array();

  $.ajax({
  type: "POST",
  url: "../php/get_all_users.php",
  async: false,
  success: function(e)
  {
    var json    = JSON.parse(e);
    user_list = json.data;
    console.log(user_list);
  },
  error: function(e) {
    alert("Failed to get list of all users");
  }
  });

  return user_list;
}

function create_user_div(div_id, username)
{
  // creates a div container with that id
  // this container is 100% width
  var div = document.createElement("div");
  div.id = div_id;
  div.style.width  = "100%";
  div.style.float  = "left";
  div.style.position = "relative";
  div.style.background = "white";

  div.innerHTML = "<h2>" + username + "</h2>";
  
  // Change eventually
  document.body.appendChild(div);

}

function create_model_div(div_id, container_id, username,  user_model_num)
{
  var outer_div = document.createElement("div");
  outer_div.style.width  = "100%";
  outer_div.style.float  = "left";
  outer_div.style.position = "relative";
  outer_div.style.background = "white";

  // We want to get the model title
  var title = "";
  $.ajax({
  type: "POST",
  url: "../php/get_model_title_db.php",
  async: false,
  data: {usr: username, umn: user_model_num},
  success: function(e)
  {
    var json  = JSON.parse(e);
    title = json.data;
  },
  error: function(e) {
    alert("Failed to get list of all users");
  }
  });

  var top_div = document.createElement("div");
  top_div.style.width  = "100%";
  top_div.style.height = "50px";
  top_div.style.float  = "left";
  top_div.style.position = "relative";
  top_div.style.background = "white";


  top_div.innerHTML = "<hr><b>"+title+"</b>";

  
  var div = document.createElement("div");
  div.id = div_id;
  // div.style.height = "200px";
  div.style.float  = "left";
  div.style.position = "relative";
  div.style.background = "white";
  

  document.getElementById(container_id).appendChild(outer_div);
  outer_div.appendChild(top_div);
  outer_div.appendChild(div);
}

function get_models(username)
{
  // returns a list of user_model_num from a given username
  var user_model_num_list = new Array();

  $.ajax({
  type: "POST",
  url: "../php/get_user_models.php",
  data: {usr: username},
  async: false,
  success: function(e)
  {
    var json    = JSON.parse(e);
    user_model_num_list = json.data;
    console.log(user_model_num_list);
  },
  error: function(e)
  {
    console.log("Failed to get " + username + "'s model numbers");
  }
  });

  return user_model_num_list;
}

function get_renovations(username, user_model_num)
{
  //  returns a list of ids which corespond to specific model
  var id_list = new Array();

  $.ajax({
  type: "POST",
  url: "../php/get_user_renovations_ids.php",
  data: {umn: user_model_num, usr: username},
  async: false,
  success: function(e)
  {
    var json    = JSON.parse(e);
    id_list = json.data;
    console.log("Model_IDS: " + id_list);
  },
  error: function(e)
  {
    console.log("Failed to get " + username + "'s model numbers");
  }
  });


  return id_list;
}



// Function to draw into container
function raphael_model_viwer(container_id, model_id, size)
{
  // We must first get data from the database
  $.getJSON(
  "../php/get_paths_txt.php", 
  {id: model_id}, 
  function(e)
  {
    // Given the paths_txt
    var paths_txt = e.paths_txt;
    // alert("Things")
    create_2d_view(container_id, paths_txt,size) 
  }
  );
}

// Aux function
function create_2d_view(container_id, paths_txt,size)
{
  var paper = Raphael(container_id, size, size);
  var table = paper.circle(size/2.0, size/2.0, size/2.0 - 5).attr(
  {
  'fill': "white",
  'fill-opacity': 0,
  'stroke': "black",
  'stroke-width': 2
  });

  var radius = table.attr('r');
  var cx = table.attr('cx');
  var cy = table.attr('cy')

  // Spit this file by lines
  var pathfile = paths_txt.split("\n");

  var cur_line = 0;
  var cur_wall = null;

  // Get compass positions
  var compos = pathfile[cur_line++].split(/[ ,]+/);
  var coor   = pathfile[cur_line++].split(/[ ,]+/);
 
  // For each line inside the file
  while (cur_line < pathfile.length)
  {

  var cur_string = pathfile[cur_line];

  // alert("Reading: " + cur_string);

  switch (cur_string)
  {

    case "WALL_ST8":

    // Create wall and bind handlers 

    var s = pathfile[++cur_line].split(" ");
    cur_wall = paper.path("M" + (s[0] * radius + cx) + "," + 
      (s[1] * radius + cy) + "L" + ( s[2] * radius + cx) + "," + 
      ( s[3] * radius + cy) );

    cur_wall.attr(
      {
      'stroke': 'black',
      'stroke-width': 2
    });

    // bind_straight_wall_handlers(cur_wall);

    cur_line++;
    break;

    case "WIN_ST8":

    // Create window and bind handlers
    var t = pathfile[++cur_line].split(" ");
    var cur_win =  paper.path("M" + (t[0] * radius + cx) + "," + 
      (t[1] * radius + cy) + "L" + ( t[2] * radius + cx) + "," + 
      ( t[3] * radius + cy));

    cur_win.attr(
      {
      'stroke': 'lightblue',
      'stroke-width': 4
    });

    cur_line++;
    break;

    case "BED": 

    // Create a bed 
    var ro = create_bed(0,0);
    var ft = paper.freeTransform(ro,
      {keepRatio: true, scale: false, distance: 2, size: 10});

    var u  = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle

    // // Move to the center of canvas
    ft.attrs.translate.x  = (u[0] * radius) + cx;
    ft.attrs.translate.y  = (u[1] * radius) + cy;
    ft.attrs.rotate = u[2];
    ft.apply();
    ft.unplug();


    // cur_line++;
    cur_line++;
    break;

    case "DESK": 

    // Create a desk
    var ro = create_desk(0,0);
    var ft = paper.freeTransform(ro,
      {keepRatio: true, scale: false, distance: 2, size: 10});

    var u  = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle

    // // Move to the center of canvas
    ft.attrs.translate.x  = (u[0] * radius) + cx;
    ft.attrs.translate.y  = (u[1] * radius) + cy;
    ft.attrs.rotate = u[2];
    ft.apply();
    ft.unplug();


    cur_line++;
    break;

    case "WARDROBE":

    // Create a closest 
    var ro = create_closest(0,0);
    var ft = paper.freeTransform(ro,
      {keepRatio: true, scale: false, distance: 2, size: 10});

    var u  = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle

    // // Move to the center of canvas
    ft.attrs.translate.x  = (u[0] * radius) + cx;
    ft.attrs.translate.y  = (u[1] * radius) + cy;
    ft.attrs.rotate = u[2];
    ft.apply();
    ft.unplug();

    cur_line++;
    break;

    case "SKYLIGHT":

    // Create a skylight 
    var ro = create_skylight(0,0);
    var ft = paper.freeTransform(ro,
      {keepRatio: true, scale: false, distance: 2, size: 10});

    var u  = pathfile[++cur_line].split(" "); // x_rel, y_rel, angle

    // // Move to the center of canvas
    ft.attrs.translate.x  = (u[0] * radius) + cx;
    ft.attrs.translate.y  = (u[1] * radius) + cy;
    ft.attrs.rotate = u[2];
    ft.apply();
    ft.unplug();

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
}
