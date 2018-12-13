const questions = {
  "modelSelection": [{
      "question": "I give permission for my designs and feedback to be used in future publications",
      "type": "checkbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 10
    },
    {
      "question": "Are you affiliated with Rensselaer Polytechnic Institute?",
      "type": "radio",
      "options": ["Yes", "No"],
      "response_type": "textarea",
      "maxlength": 10
    },
    {
      "question": "Years of formal education in architecture?",
      "type": "textbox",
      "options": [],
      "response_type": "number",
      "maxlength": 10
    },
    {
      "question": "Years of formal education in visual arts?",
      "type": "textbox",
      "options": [],
      "response_type": "number",
      "maxlength": 10
    },
    {
      "question": "Years of job experience in architecture? (including internships)",
      "type": "textbox",
      "options": [],
      "response_type": "number",
      "maxlength": 10
    },
    {
      "question": "Years of job experience in visual arts? (including internships)",
      "type": "textbox",
      "options": [],
      "response_type": "number",
      "maxlength": 10
    },
    {
      "question": "Select any of the following modeling software you have used",
      "type": "checkbox-multiple",
      "options": ["SketchUp", "AutoCAD", "Rhino", "Maya", "3DS Max", "Cinema 4D", "Blender", "Revit", "OpenSCAD"],
      "response_type": "textarea",
      "maxlength": 10

    },
    {
      "question": "List other modeling software you have used",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 50
    },
    {
      "question": "Years of experience with modeling software?",
      "type": "textbox",
      "options": [],
      "response_type": "number",
      "maxlength": 10
    },
    {
      "question": "Other relevant education or experience?",
      "type": "textbox",
      "options": [""],
      "response_type": "textarea",
      "maxlength": 50
    },
    {
      "question": "Are you colorblind?",
      "type": "radio",
      "options": ["Yes", "No"],
      "response_type": "textarea",
      "maxlength": 10
    },
    {
      "question": "If we may follow up with questions about models created in our system, please enter your email. (We will not add you to a mailing list or share your email)",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 50
    }
  ],
  "sketchPage": [{
      "question": "Select the category of this model",
      "type": "dropdown",
      "options": ["Bedroom", "Dorm", "Living Room", "Apartment/House", "Classroom", "Office", "Lobby", "Other"],
      "response_type": "textarea",
      "maxlength": 50
    },
    {
      "question": "When was the last time time you visited this space",
      "type": "dropdown",
      "options": ["Less than a week ago", "Less than a month ago", "Less than a year ago", "Less than 4 years ago", "More than 4 years ago", "Never, this is a new design", "Never, I have never visited this place"],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "How often did you visit this space?",
      "type": "dropdown",
      "options": ["Once", "Occasionally", "Multiple times a week", "Never"],
      "response_type": "textarea",
      "maxlength": 50
    },
    {
      "question": "How confident are you in modeling this space? (Dimensions, Orientation, Furniture, Layout)",
      "type": "radio",
      "options": ["5 (very confident)", "4", "3", "2", "1 (unsure)"],
      "response_type": "textarea",
      "maxlength": 50
    },
    {
      "question": "Any addional information about the model that you would like to share?",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "What did you find fun or interesting in this sketching enviorment? (if applicable)",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "What addional features should be added to the system to allow greater flexiblility in design?",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "Describe some designs that you were not able to create due to system limitations",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "Was there anything you did not like about working in this enviorment?",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "Were there any elements of the user interface that was hard to use or confusing?",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    }
  ],
  "modelRender": [{
      "question": "Does the 3D model match your design intentions?",
      "type": "radio",
      "options": ["Matched my intentions (no revisions required)", "Matched my intentions (some revisions were required)", "Failed to match my intentions (even after revision)"],
      "response_type": "textarea",
      "maxlength": 50
    },
    {
      "question": "Describe your overall impression of the system's effectiveness in constructing a 3D model from your design",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "Describe cases where the system incorrectly interpreted your design intentions",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
  ],
  "taskPage": [],
  "simulationRender": [{
      "question": "Share this model with the OASIS community?",
      "type": "radio",
      "options": ["Yes", "No"],
      "response_type": "textarea",
      "maxlength": 10
    },
    {
      "question": "Did you understand the results of the simulation? Describe anything unclear or confusing",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    },
    {
      "question": "Did the system allow you to create and test daylighting performance? Do  you understand the areas of over and under illumination?",
      "type": "textbox",
      "options": [],
      "response_type": "textarea",
      "maxlength": 100
    }
  ]
}
export default questions;