// Helper functions in generation of feedback forms
function generate_HTML_form(jsonObj) {
	
	// This function takes in a json object that contains questions
	// Format expexted is an array of questions array of questions psudo objects
	// Returns a string
	
	var str_result = "";
	
	// Start Form
	str_result += "<form id = 'feedback_form'>\n";
	
		
	// Test by just pasting questions only from jsonObj
	for( var i = 0; i < jsonObj.length; i++) {
		
		
		// Question we are working with right now
		var cur_question = jsonObj[i];
		
		// Get the name for field we are going to generate
		var name = str_qid_tab(cur_question["qid"], cur_question["tab"]);
		
		
		switch(cur_question["type"]) {
			case "scaleRadio":
				str_result += generate_HTML_scaleRadio( name, cur_question["question"] , cur_question["responce"] ); 
				break;
			case "boolRadio":
				str_result += generate_HTML_boolRadio( name, cur_question["question"] , cur_question["responce"] ); 
				break;
			case "smTxt":
				str_result += generate_HTML_smTxt( name, cur_question["question"] , cur_question["responce"] ); 
				break;
			case "lgTxt":
				str_result += generate_HTML_lgTxt( name, cur_question["question"] , cur_question["responce"] ); 
				break;
			default:
				console.log("ERROR: Question not of reconized type")
		}
		
		str_result += "<br>\n";
	}
	
	// End Form
	str_result += "</form>" + "\n";
	
	return str_result;
	
}

function ajax_str() {
	return " "
}
function noenter() { 
	// Special function that when binded to an form input will
	// prevent enter from submit the form.
	return !(window.event && window.event.keyCode == 13);
}

function str_qid_tab(qid,tab) {
	// takes in strings qid and tab and encodes them into a format
	// makes parsing these easier for data storage
	// returns string
	
	return tab + "_" + qid;
	
}

function generate_HTML_scaleRadio(name,question,responce) {
	// Function will return scales 1- 5 required for the radio button
	
	// Function will return one line text field
	var result = question + "<br>\n";
	
	for(var i = 0; i < 5; i++) {
		
		if( responce != "NaN" && i + 1 == parseInt(responce) ) {
			
			result += ( i + 1 ) + "<input type='radio' name='" + name + "' value = '" + ( i + 1 ) + "' checked>&nbsp" ;
			
		}else{
			
			result += (i + 1) + "<input type='radio' name='" + name + "' value = '" + ( i + 1 ) + "'>&nbsp";
		}
		
	}
	
	result += "<br>\n";
	return result;
	
}

function generate_HTML_boolRadio(name,question,responce) {
	// Function will return bool required for the radio button
	
	
	// Function will return one line text field
	var result = question + "<br>\n";

	switch(responce) {
		
		case "True":
			result += "<input type='radio' name='" + name + "' value = 'True' checked> True";
			result += "<input type='radio' name='" + name + "' value = 'False' > False"; 
			break;
		case "False":
			result += "<input type='radio' name='" + name + "' value = 'True' > True";
			result += "<input type='radio' name='" + name + "' value = 'False' checked> False"; 
			break;
		case "NaN":
			result += "<input type='radio' name='" + name + "' value = 'True' > True";
			result += "<input type='radio' name='" + name + "' value = 'False' > False"; 
			break;
		default:
			console.log("ERROR: Unreconized responce, not a bool value");
	}
		
	result += "<br>\n";
	return result;
	
}

function generate_HTML_smTxt(name, question, responce) {
	
	// Function will return one line text field
	var result = question + "<br>\n";
	
	if(responce != "NaN") {
		// We have a previous responce, load up that responce
		result += "<input type='text' name='" + name + "' value = '" + responce + "' onKeyPress='return noenter()' >" + "<br>\n";

	}else{
		// No responce, leave blank
		result += "<input type='text' name='" + name + "' onKeyPress='return noenter()'>" + "<br>\n";
	}
	
	return result;
}

function generate_HTML_lgTxt(name,question,responce) {
	// Function will return a large text box
	
	var result = question + "<br>\n";
	
	if(responce != "NaN") {
		// We have a previous responce, load up that responce
		result += "<textarea rows='5' cols='20' name='" + name + "' >" + "\n";
		result += responce + "\n";
		result += "</textarea><br>\n";

	}else{
		// No responce, leave blank
		result += "<textarea rows='5' cols='30' name='" + name + "' >" + "\n";
		result += "</textarea><br>\n";
	}
	return result;
}


