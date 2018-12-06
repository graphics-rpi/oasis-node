function copy() {
  console.log("copy");
  $('[data-toggle="popover"]').popover("show");

  setTimeout(function() {
     $('[data-toggle="popover"]').popover("hide");
  },500);
}

var clipboard = new Clipboard('.btn');

  clipboard.on('success', function(e) {
  console.info('Action:', e.action);
  console.info('Text:', e.text);
  console.info('Trigger:', e.trigger);

  e.clearSelection();
});

clipboard.on('error', function(e) {
console.error('Action:', e.action);
console.error('Trigger:', e.trigger);
});

//var id_val = path.substring(38);
//
//var temp_val ="";
//for(var i=0;i<id_val.length;i++) {
//  if(id_val[i]=='/')
//    break;
//  temp_val+=id_val[i];
//}
//id_val = temp_val;   
//
//var path_button = document.createElement("input"); path_button.setAttribute("value","http://hurricane.cs.rpi.edu/temp/test.php?path="+path+"&id="+id_val);
//
//path_button.setAttribute("id","path_button");
//path_button.setAttribute("class","control-label");
////  path_button.setAttribute("size","50");
//path_button.setAttribute("style","margin-right:10px;width:80%;")
//path_button.setAttribute("readonly","true");
//document.getElementById("sidecontent").appendChild(path_button);
//
//var copy_button = document.createElement("button");
//copy_button.setAttribute("type","button");
//copy_button.setAttribute("class","btn btn-default");
//copy_button.setAttribute("data-toggle","popover");
//copy_button.setAttribute("data-placement","bottom");
//copy_button.setAttribute("data-content","copied");
//copy_button.setAttribute("onclick","copy()");    
//copy_button.setAttribute("data-clipboard-target","#path_button");
//var copy_icon = document.createElement("img");  
//copy_icon.setAttribute("src","../images/clippy.svg");
//copy_icon.setAttribute("alt","Copy to Clipboard");
//copy_icon.setAttribute("width","10");
//copy_button.appendChild(copy_icon);
//document.getElementById("sidecontent").appendChild(copy_button);