// Console
//console.log("Start loading ribbon_events.js");

function global_button_handler(event_str) {
  //console.log('global_button_handler(\'' + event_str + '\')');
  // console.log(GLOBAL_RIBBON_TAB);

  // Sends the button triggered right back to sketching_ui.js
  if( GLOBAL_RIBBON_TAB == "tab-sketch" ) {
  sketching_ribbon_handler(event_str);
  }
  
  if( GLOBAL_RIBBON_TAB == "tab-load" ) {
  sketching_ribbon_handler(event_str);
  }

  if( GLOBAL_RIBBON_TAB == "tab-3d" ) {
  sketching_ribbon_handler(event_str);
  }

  if( GLOBAL_RIBBON_TAB == "tab-task" ) {
  sketching_ribbon_handler(event_str);
  }

  if( GLOBAL_RIBBON_TAB == "tab-analysis" ) {
  sketching_ribbon_handler(event_str);
  }

}

/*********************************************************************
* Globals For Sketching function
**********************************************************************/
function global_tab_handler(event_str) {

  // Did users click the naviation tabs
  if( event_str == "tab-nav-next") {

  switch( GLOBAL_RIBBON_TAB) {
    case 'tab-load':
    global_tab_handler('tab-sketch');
    window.ribbon1.setTabActive("tab-sketch");
    break;
    case 'tab-sketch':
    global_tab_handler('tab-3d');
    window.ribbon1.setTabActive("tab-3d");
    break;
    case 'tab-3d':
    global_tab_handler('tab-task');
    window.ribbon1.setTabActive("tab-task");
    break;
    case 'tab-task':
    global_tab_handler('tab-task');
    window.ribbon1.setTabActive("tab-task");
    break;
    default:
    alert("State Error: " + event_str);
    break;
  }

  return;
  }

  if( event_str == "tab-nav-back") {

  switch( GLOBAL_RIBBON_TAB) {
    case 'tab-load':
    global_tab_handler('tab-load');
    window.ribbon1.setTabActive("tab-load");
    break;
    case 'tab-sketch':
    global_tab_handler('tab-load');
    window.ribbon1.setTabActive("tab-load");
    break;
    case 'tab-3d':
    global_tab_handler('tab-sketch');
    window.ribbon1.setTabActive("tab-sketch");
    break;
    case 'tab-task':
    global_tab_handler('tab-3d');
    window.ribbon1.setTabActive("tab-3d");
    break;
    case 'tab-analysis':
    global_tab_handler('tab-task');
    window.ribbon1.setTabActive("tab-task");
    break;
    default:
    alert("State Error:" + event_str);
    break;
  }

  return;
  }

  
  //console.log("DEBUG: global_tab_handler called: " + event_str); //<------------------------------------

  // What I got back from webpage
  //console.log(window.ribbon1);
  //console.log('global_tab_handler(\'' + event_str + '\')');

  // Sending data to server to save feedback questions from this tab
  // TODO Save feedback responces
  // $("#feedback_form").ajaxSubmit({url: '../php/save_responces.php' , type: 'post'});
  // Loading the new content on the feedback pane

  // If the ribbon is loaded, then a change in tab requires
  // a change in webpage
  if(GLOBAL_RIBBON_STATE == "loaded") 
  {
  //console.log("DEBUG: ribbon state == loaded"); // <--------------------------------------------------

  // We are moving from the sketch tab to another tab
  if(GLOBAL_RIBBON_TAB == "tab-sketch" ) {

    // Getting the URL we will visit next
    var url = ""; // where we will go next

    switch(event_str) {

    case "tab-sketch": 
      return;

    case "tab-load":
      url = "../pages/load_tab.php"; break;

    case "tab-3d":
      url = "../pages/3d_tab.php"; break

    case "tab-task":
      url = "../pages/task_tab.php"; break;

    default:
      alert("no such tab exisit");
    }


    global_button_handler("tab-switch-sketching:" + url);
    return; // we handle redirection + form save in sketching_ui.js

  } else if( GLOBAL_RIBBON_TAB == "tab-task" && event_str != "tab-task" ) {

    // When users are creating task and then switch tab before running all task
    // We need confirmation to continue or halt
    var action = global_button_handler("tab-switch-task");
    if(action == "halt") { return; }

  }

  // Save form swtich statments
  switch(GLOBAL_RIBBON_TAB)
  {

    case "tab-load":
    //console.log("DEBUG:about to run save_form"); // <-----------------------------------
    save_form('fb_load_form');
    //console.log("DEBUG: ran save_form"); // <-----------------------------------

    break;

    case "tab-sketch":
    // Note this will not run when switching to 3d-tab, but we handled that in sketching_ui.js
    // Note this will not run when switching to any other tab, we will handle this in sketching_ui.js
    // save_form('fb_sketch_form');
    alert("error, shouldn't reach here 102");
    break;

    case "tab-3d":
    save_form('fb_3d_form');
    break;

    case "tab-analysis":
    save_form('fb_sim_form');
    //alert("%%%%%%%%%%%%%%%%%%SAVING");

    // Moving off tab analysis, reset our view path
    $.ajax({ type: "POST", url: "../php/set_view_path_to_session.php", async: false, 
      success : function(e) {}
    });
    break;

    default:
    break;
    
  }//save_form switch

  // REDIRECTION STATEMENTS
  switch(event_str)
  {
    case "tab-sketch":

    if(GLOBAL_RIBBON_TAB != "tab-sketch")
    {
      window.location = "../pages/sketching_tab.php"; 
    } else {
      alert("error, shouldn't reach here 141");
      //console.log("no redirect");
    }

    break;

    case "tab-3d":

    if(GLOBAL_RIBBON_TAB != "tab-3d")
    {
      window.location = "../pages/3d_tab.php"; 
    } else {     

      //console.log("no redirect") 
    }

    break;
    case "tab-task":
    if(GLOBAL_RIBBON_TAB != "tab-task")
    {
      window.location = "../pages/task_tab.php"; 
    }else{
      //console.log("no redirect");
    }

    break;

    case "tab-load":
    if(GLOBAL_RIBBON_TAB != "tab-load") {
      window.location = "../pages/load_tab.php"; 
    } else {
      //console.log("no redirect");
    }

    case "tab-analysis":
    if(GLOBAL_RIBBON_TAB != "tab-analysis")
    {
      //window.location = "../pages/sim_tab.php"; 
      return; // we don't want to move you here. You have to be directed here.

    } else {     

      //console.log("no redirect") 
    }

    break;

    default :
    alert("Not Found: " + event_str);
  }
  }
  else 
  {
  // GLOBAL_RIBBON_STATE == "not loaded"
  // This runs before a page is fully loaded
  // switch(event_str)
  // {
  //   case "tab-sketch":
  //   change_feedback_on_tab(event_str);
  //   break;
  //   case "tab-3d":
  //   change_feedback_on_tab(event_str);
  //   break;
  //   case "tab-task":
  //   change_feedback_on_tab(event_str);
  //   break;
  //   case "tab-result":
  //   change_feedback_on_tab(event_str);
  //   break;
  //   case "tab-load":
  //   // We don't need to change feedback tab
  //   break;
  //   default:
  //   alert("Not Found: " + event_str);
  // }
  }
}

function change_feedback_on_tab( tab_str )
{
  $.getJSON(
    '../php/get_questions.php', 
    {tab : tab_str}, 
    function(e) 
    { 
    var str_result = generate_HTML_form(e);
    document.getElementById("feedback").innerHTML= str_result;
    }
  );
}

function save_form(form_id)
{
  // AJAX call to save what is on the form onto the server
  // Requires jquery.form.js
  //alert("CLEAR LOG NOW: SAVE FORM CALLED");
  $('#'+form_id).ajaxSubmit(function() {
    //console.log("Feedback Saved");
    ready_ajax("Feedback Saved");
    GLOBAL_FEEDBACK_STATUS = "READY";
  });
}

window.onbeforeunload = function (e) {
  if(typeof GLOBAL_FEEDBACK_STATUS !== 'undefined' && GLOBAL_FEEDBACK_STATUS == "SAVING") {

  switch(GLOBAL_RIBBON_TAB)
  {

    case "tab-load":
    save_form('fb_load_form');
    break;

    case "tab-sketch":
    save_form('fb_sketch_form');
    break;

    case "tab-3d":
    save_form('fb_3d_form');
    break;

    case "tab-analysis":
    save_form('fb_sim_form');
    break;

    default:
    break;
    
  }//save_form switch

    // var message = "Saving feedback in progress.\nTo ensure your feedback reaches us please return to OASIS until your feedback is done saving.",
    // e = e || window.event;
    // // For IE and Firefox
    // if (e) {
    //   e.returnValue = message;
    // }

    // // For Safari
    // return message;
  }
};
//console.log("Done loading ribbon_events.js");




/*
  window.ribbon1.getBoundingBox().on("acidjs-ribbon-tool-clicked", function(e, data) {
  alert("Things and Jazz");  
  });
*/
