// This script holds all the ribbon view objects
console.log("Start ribbon_ui.js");
(function()
{

  "use strict";

  window.ribbon1 = new window.AcidJs.Ribbon(
  {

  //appIconUrl: "my-custom-app-icon.png", // {String} [optional] top left application icon
  //flat: true, // {Boolean} [optional] applies flat ribbon styles as in MS Office 2013 and above
  boundingBox: $("#ribbon-ui"), // {jQueryDomObject} [required] ribbon bar placeholder element
  cssClasses: [ // {Array} [optional] additional CSS classes to be applied to the boundingBox. Default: []
    "css-class-abc",
    "css-class-def",
    "css-class-ghi"
  ],
  ng:
  { // {Object} support for AngularJs directives
    app: "",
    show: "",
    init: ""
  },
  //loadCss: false, // {Boolean} [optional] if set to false, the stylesheet of the ribbon will not be loaded from the control, but you will have to register it on the page via the <link /> tag
  //appRoot: "nested/folder/", // {String} [optional] by default, URLS of the ribbon are resolved from the root. Here you can specify different folder
  width: "100%", // {String} [optional] width (max-width) of the ribbon in pixels of percentage. default: "100%"
  minwidth: "auto", // {String} [optional] min-width of the ribbon in pixels of percentage. default: "auto"
  config:
  {
    defaultSelectedTab: 0, // {Number} [optional] default selected tab, default: 0
    tabs: 
    [
    // {
    //   label: "<<< Back",
    //   hint: "Move back",
    //   name: "tab-nav-back",
    //   enabled: true,
    //   visible: true,
    //   ribbons: []
    // },
    {
      label: "Step 1: Create / Load Model",
      hint: "Load previously created models",
      name: "tab-load",
      enabled: true,
      visible: true,
      ribbons: 
      [
      {
        label: "",
        width: "70%",
        tools: 
        [
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Create a new model",
            name: "button-load-new",
            label: "New Model",
            icon: "newproject.png",
            props: {}
          }
          ]
        }
        ]
      },
      {
        label: "",
        width: "30%",
        tools: 
        [
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-video-tutorial",
            label: "Help Video",
            icon: "help_video.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-help",
            label: "Help Menu",
            icon: "help.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to create a report to make this site better!",
            name: "button-bug",
            label: "Bug Report",
            icon: "bug.png",
            props: {}
          }
          ]
        }
        ]
      }

      ]
    },
    {
      label: "Step 2: Sketch a Room",
      hint: "Sketching tools",
      name: "tab-sketch",
      enabled: true,
      visible: true,
      ribbons: 
      [
      {
        label: "Primitives",
        width: "40%",
        tools: 
        [
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Add a wall primitive to the canvas",
            name: "button-straight-wall",
            label: "Wall",
            icon: "wall.png",
            props: {}
          },
          // {
          //   hint: "Unsupported Primitives. Coming Soon!",
          //   name: "button-curved-wall",
          //   label: "Curved Wall",
          //   icon: "curved-wall.png",
          //   props: {}
          // },
          {
            hint: "Click on canvas twice for the start and end position of windows",
            name: "button-straight-window",
            label: "Window",
            icon: "window.png",
            props: {}
          },
          {
            hint: "Place skylight in interior location",
            name: "button-skylight",
            label: "Skylight",
            icon: "skylight.png",
            props: {}
          },
          {
            hint: "Click to make a bed",
            name: "button-bed",
            label: "Bed",
            icon: "bed.png",
            props: {}
          },
          {
            hint: "Click to make a desk",
            name: "button-desk",
            label: "Desk",
            icon: "desk.png",
            props: {}
          },
          {
            hint: "Click to make a closet",
            name: "button-closet",
            label: "Wardrobe",
            icon: "wardrobe.png",
            props: {}
          }
          ]
        }
        ]
      },
      {
        label: "Operations",
        width: "10%",
        tools: 
        [
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Click on walls to remove them from canvas",
            name: "button-remove",
            label: "Remove",
            icon: "remove.png",
            props: {}
          }
          ]
        }
        ]
      },
      {
        label: "Geospatial",
        width: "20%",
        tools: 
        [
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Click on canvas to change spacial orientation",
            name: "button-change-orientation",
            label: "Orientation",
            icon: "compass.png",
            props: {}
          },
          {
            hint: "Click to choose latitude and longitude coordinates",
            name: "button-change-coordinates",
            label: "Location",
            icon: "globe.png",
            props: {}
          }
          ]
        }
        ]
      },
      {
        label: "Other",
        width: "15%",
        tools: 
        [
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-video-tutorial",
            label: "Help Video",
            icon: "help_video.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [

          {

            hint: "Click to get more information about the actions on this page!",
            name: "button-help",
            label: "Help Menu",
            icon: "help.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to create a report to make this site better!",
            name: "button-bug",
            label: "Bug Report",
            icon: "bug.png",
            props: {}
          }
          ]
        }
        ]
      },
       //,
      // {
      //   label: "",
      //   width: "20%",
      //   tools: 
      //   [
      //   {
      //     type: "buttons",
      //     size: "large",
      //     commands:
      //     [
      //     {
      //       hint: "save wall file locally",
      //       name: "button-save-wallfile",
      //       label: "Download Wallfile",
      //       icon: "save.png",
      //       props: {}
      //     }
      //     ]
      //   }
      //   ]
      // }
      ]
    },
    {
      label: "Step 3: Generate 3D Model",
      hint: "View the 3D visualization of your sketch",
      name: "tab-3d",
      visible: true,
      ribbons: 
      [
      {
        label: "",
        width: "70%",
        tools: 
        [
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Toggle Ceiling",
            name: "button-3d-ceiling",
            label: "Toggle Ceiling",
            icon: "ceiling.png",
            props: {}
          }
         ]
        }
        // ,
        // {
        //   type: "buttons",
        //   size: "large",
        //   commands:
        //   [
        //   {
        //     hint: "Illumination visualization",
        //     name: "button-3d-fcv",
        //     label: "Analysis",
        //     icon: "analysis.png",
        //     props: {}
        //   }
        //   ]
        // }
        ]
      },
      {
        label: "",
        width: "30%",
        tools: 
        [
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-video-tutorial",
            label: "Help Video",
            icon: "help_video.png",
            props: {}
          }
          ]
        },

        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-help",
            label: "Help Menu",
            icon: "help.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to create a report to make this site better!",
            name: "button-bug",
            label: "Bug Report",
            icon: "bug.png",
            props: {}
          }
          ]
        }
        ]
      }
      ]
    },
    {
      label: "Step 4: Create Daylighting Simulation",
      hint: "Start lighting simulation task on your sketch",
      name: "tab-task",
      enabled: true,
      visible: true,
      ribbons: 
      [
      {
        label: "",
        width: "70%",
        tools: 
        [
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Create a new simulation task",
            name: "button-daylight-task",
            label: "New Task",
            icon: "new-task.png",
            props: {}
          }
          ]
        }/*,
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Create a new simulation task during soltices",
            name: "button-solstice",
            label: "Solstice",
            icon: "new-task.png",
            props: {}
          }
          ]
        },
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Create a new simulation task for the first of each month",
            name: "button-monthly",
            label: "Monthly",
            icon: "new-task.png",
            props: {}
          }
          ]
        }  */  
        ]
      },
      {
        label: "",
        width: "30%",
        tools: 
        [
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-video-tutorial",
            label: "Help Video",
            icon: "help_video.png",
            props: {}
          }
          ]
        },

        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-help-task",
            label: "Help Menu",
            icon: "help.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to create a report to make this site better!",
            name: "button-bug-task",
            label: "Bug Report",
            icon: "bug.png",
            props: {}
          }
          ]
        }
        // {
        //   type: "split-button",
        //   size: "large",
        //   commands:
        //   [
        //   {
        //     hint: "Refresh Task list",
        //     name: "button-daylight-refresh",
        //     label: "Refresh Task List",
        //     icon: "refresh.png",
        //     props: {}
        //   }
        //   ]
        // }

        ]
      }
      ]
    },
    {
      label: "Step 5: Analyze Simulation",
      hint: "View the daylighting visualization of your sketch",
      name: "tab-analysis",
      visible: true,
      ribbons: 
      [
      {
        label: "",
        width: "70%",
        tools: 
        [
        // {
        //   type: "buttons",
        //   size: "large",
        //   commands:
        //   [
        //   {
        //     hint: "Toggle Ceiling",
        //     name: "button-3d-ceiling",
        //     label: "Toggle Ceiling",
        //     icon: "ceiling.png",
        //     props: {}
        //   }
        //   ]
        // },
        {
          type: "buttons",
          size: "large",
          commands:
          [
          {
            hint: "Illumination visualization",
            name: "button-3d-fcv",
            label: "Analysis",
            icon: "analysis.png",
            props: {}
          }
          ]
        }
        ]
      },
      {
        label: "",
        width: "30%",
        tools: 
        [
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-video-tutorial",
            label: "Help Video",
            icon: "help_video.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to get more information about the actions on this page!",
            name: "button-help",
            label: "Help Menu",
            icon: "help.png",
            props: {}
          }
          ]
        },
        {
          type: "split-button",
          size: "large",
          commands:
          [
          {
            hint: "Click to create a report to make this site better!",
            name: "button-bug",
            label: "Bug Report",
            icon: "bug.png",
            props: {}
          }
          ]
        }
        ]
      }
      ]
    }
    // ,
    // {
    //   label: "Next >>>",
    //   hint: "Move Next",
    //   name: "tab-nav-next",
    //   enabled: true,
    //   visible: true,
    //   ribbons: []
    // }
    ]
  }
  });

  // Don't belive these need to be in the same file as the other items!
  window.ribbon1.getBoundingBox().on("acidjs-ribbon-tool-clicked", function(e, data)
  {

  // var debug_button = window.ribbon1.getToolsByName(data['command']);
  // console.log(debug_button);

  global_button_handler(data['command']);

  });

  window.ribbon1.getBoundingBox().on("acidjs-ribbon-tab-changed", function(e, data)
  {
  global_tab_handler(data['name']);
  window.console.info("acidjs.ribbon event fired", e.type, data);
  });

  window.ribbon1.getBoundingBox().on("acidjs-ribbon-toggle", function(e, data)
  {
  window.console.info("acidjs.ribbon event fired", e.type, data);
  });

  window.ribbon1.getBoundingBox().on("acidjs-ribbon-ready", function(e, data) {
  window.console.info("acidjs.ribbon event fired", e.type, data);

  // set highlighted tabs group
  //window.ribbon1._later(function() {
  //window.ribbon1.highlightTabsGroup(["tab-insert", "tab-page-layout"], "font-tools", "Font Tools", "#f00");
  //window.ribbon1.highlightTabsGroup(["tab-draw", "tab-something-layout"], "table-tools", "Table Tools", "#006ac1");
  //}, 2000);

  // disable the ribbon on ready
  //window.ribbon1.disableRibbon();

  // hide the ribbon on ready
  //window.ribbon1.hide();

  // collapse the ribbon on ready
  //window.ribbon1.collapse();

  // set some tools as disabled by default
  // window.ribbon1.disableTools([ "button-curved-wall" ]);

   window.ribbon1.disableTabs(["tab-analysis"]);

  });

  // // Creates the window
  // window.ribbon1.init();


})();



console.log("Done ribbon_ui.js");
