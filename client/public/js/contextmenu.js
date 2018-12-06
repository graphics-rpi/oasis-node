/**
 * @blog     http://terryyoung.blogspot.com/2011/08/context-menus-for-raphaeljs.html
 */


///////////////////////////////////////////////////////////////////////////////
// Please scroll to the bottom to look at the usage code of this demo.
// These below are some core extensions to RaphaelJS that makes it all happen.

var testobj;

/**
 * Simplifies something like this:
 *
 * this.ox = this.type == 'rect' ? this.attr('x') : this.attr('cx');
 * this.oy = this.type == 'rect' ? this.attr('y') : this.attr('cy');
 *
 * to this:
 *
 * el.o();  // and better, it supports chaining
 *
 * @copyright   Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 */
Raphael.el.is = function (type) { return this.type == (''+type).toLowerCase(); };
Raphael.el.x = function () { return this.is('circle') ? this.attr('cx') : this.attr('x'); };
Raphael.el.y = function () { return this.is('circle') ? this.attr('cy') : this.attr('y'); };
Raphael.el.o = function () { this.ox = this.x(); this.oy = this.y(); return this; };

var HOVERING_OBJECT = false;
var HOVER_OBJ_ID = " ";

/**
 *
 * getABox() for RaphaelJS - getBBox() On Steroids
 * More routine, pre-calculated values that getBBox() doesn't provide
 *
 * @author    Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 *
 */
Raphael.el.getABox = function ()
{
  var b = this.getBBox(); // thanks, I'll take it from here...

  var o =
  {
    // we'd still return what the original getBBox() provides us with
    x:        b.x,
    y:        b.y,
    width:      b.width,
    height:     b.height,

    // now we can actually pre-calculate the following into properties that are more readible for humans
    // x coordinates have three points: left edge, centered, and right edge
    xLeft:      b.x,
    xCenter:    b.x + b.width / 2,
    xRight:     b.x + b.width,


    // y coordinates have three points: top edge, middle, and bottom edge
    yTop:       b.y,
    yMiddle:    b.y + b.height / 2,
    yBottom:    b.y + b.height
  };


  // now we can produce a 3x3 combination of the above to derive 9 x,y coordinates

  // center
  o.center    = {x: o.xCenter,  y: o.yMiddle };

  // edges
  o.topLeft   = {x: o.xLeft,    y: o.yTop };
  o.topRight  = {x: o.xRight,   y: o.yTop };
  o.bottomLeft  = {x: o.xLeft,    y: o.yBottom };
  o.bottomRight = {x: o.xRight,   y: o.yBottom };

  // corners
  o.top     = {x: o.xCenter,  y: o.yTop };
  o.bottom    = {x: o.xCenter,  y: o.yBottom };
  o.left    = {x: o.xLeft,    y: o.yMiddle };
  o.right     = {x: o.xRight,   y: o.yMiddle };

  // shortcuts to get the offset of paper's canvas
  o.offset    = $(this.paper.canvas).parent().offset();

  return o;
};

/**
 *
 * Routine method, so that you can just do this.drag(move, start, end);
 *
 * @author    Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 *
 */



/**
 *
 * Makes Raphael.el.draggable applicable to Raphael Sets, and chainable
 *
 * @author    Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 *
 */


/**
 * This is a custom function for Raphael elements, and is designed
 * to be used with properties added and defined in Raphael.styles
 *
 * @author    Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 */
Raphael.el.style = function (state, style, aniOptions)
{
  if (!this.class)
  {
    this.class = style ? style : 'default';
    this.aniOptions = aniOptions ? aniOptions : null;

    // start assigning some basic behaviors
    // this.mouseover(function () { HOVERING_OBJECT = true; HOVER_OBJ_ID = this.id; this.style('hover'); });
    // this.mouseout(function () { HOVERING_OBJECT = false; HOVER_OBJ_ID = this.id; this.style('base'); });
    // this.mousedown(function () { this.style('mousedown'); });
    // this.click(function () { this.style('hover'); });
        // start assigning some basic behaviors
    this.mouseover(function () {
      HOVER_OBJ_ID = this.id;
    });
    this.mouseout(function () {
      HOVER_OBJ_ID = this.id;
    });
    this.mousedown(function () { this.style('mousedown'); });
    this.dblclick(function () {
      if(sketchpadPaper.getById(this.id).freeTransform.opts.drag == false ) {
        sketchpadPaper.getById(this.id).freeTransform.setOpts({drag: 'self'});
        sketchpadPaper.getById(this.id).drag(objectDragMove, objectDragStart, objectDragStop);
        HOVERING_OBJECT = true;
        this.style('hover');
      }
      else{
        sketchpadPaper.getById(this.id).freeTransform.setOpts({drag:false});
        HOVERING_OBJECT = false;
        this.style('base');
      }
    });
    this.click(function () { this.style('hover'); });
  }

  if (typeof style != 'undefined') this.class = style;
  if (typeof aniOptions != 'undefined') this.aniOptions = aniOptions;

  style = this.class ? this.class : style;
  state = state ? state : 'base';
  aniOptions = this.aniOptions ? this.aniOptions : null;


  // The structure of Raphael.styles is " type --> style --> state "
  if (aniOptions)
  {
    this.animate(
      Raphael.styles[this.type][style][state],
      aniOptions.duration,
      aniOptions.easing,
      function () {
        if (aniOptions.callback)
        {
          aniOptions.callback()
        }

        // do it again without the animation, to apply attributes that can't be animated, such as cursor, etc.
        this.attr(Raphael.styles[this.type][style][state]);
      });
  }
  else
  {
    this.attr(Raphael.styles[this.type][style][state]);
  }

return this; // chaining, e.g. shape.attr({ stroke: '#fff'}).style('dragging').toFront();
};


/**
 * Same API as Raphael.el.style for Raphael Sets
 *
 * @author    Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 */
Raphael.st.style = function (state, style, animated)
{
  for (var i = 0, j = this.items.length; i < j; i++)
  {
    var item = this.items[i];
    item.style(state, style, animated);
  }

return this; // chaining, e.g. set.attr({ stroke: '#fff'}).style('dragging').toFront();
};


/**
 * This is a method to add more style sets at runtime
 *
 * @author    Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 */
Raphael.setStyles = function (styles)
{
  Raphael.styles = $.extend(true, {}, styles);
};



Raphael.setStyles
(
  {
    rect:
    {
    // base:    base style of a shape (For on/off states, "base" is the "off" state)
    // hover:     style when this line is directly hovered (previous state will be stored to prev)
    // mousedown:   style when mousedown onto this line (mouseup restores to hover style)

      'default':
      {
        base:
        {
          // fill:       '#ddd',
          opacity: .25, 
          'stroke-width': 2
        },
        hover:
        {
          cursor:     'pointer',

          opacity:    .4
        },
        mousedown:
        {
          // fill:       '#a3badc'
        }
      },
      'custom':
      {
        base:
        {
          // fill:       '#abb4c2',
          opacity: .25, 
          'stroke-width': 4
        },
        hover:
        {
          cursor:     'pointer',
          opacity:    .4,
          stroke:     '#617a8b',
          'stroke-width': 4
        },
        mousedown:
        {
          // fill:       '#527b94',
          stroke:     '#617a8b'
        }
      }
    }
  }
);



//
// This is a modified version of the jQuery context menu plugin. Credits below.
//

// jQuery Context Menu Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
//
// More info: http://abeautifulsite.net/2008/09/jquery-context-menu-plugin/
//
// Terms of Use
//
// This plugin is dual-licensed under the GNU General Public License
//   and the MIT License and is copyright A Beautiful Site, LLC.
//
(function($)
{
  $.extend($.fn,
  {
    contextMenu: function(options)
    {
      // Defaults
      var defaults =
        {
          fadeIn:    150,
          fadeOut:     75
        },
        o = $.extend(true, defaults, options || {}),
        d = document;

      // Loop each context menu
      $(this).each( function()
      {
        var el = $(this),
          offset = el.offset(),
          $m = $('#' + o.menu);

        // Add contextMenu class
        $m.addClass('contextMenu');

        // Simulate a true right click
        $(this).mousedown( function(e) {

          // e.stopPropagation(); // Terry: No, thank you
          $(this).mouseup( function(e) {
            // e.stopPropagation(); // Terry: No, thank you
            var target = $(this);

            $(this).unbind('mouseup');

            if( e.button == 2 ) {
              // Hide context menus that may be showing
              $(".contextMenu").hide();
              // Get this context menu

              if( el.hasClass('disabled') ) return false;

              // show context menu on mouse coordinates or keep it within visible window area
              var x = Math.min(e.offsetX+95, $(document).width() - $m.width() - 5),
                y = Math.min(e.offsetY+45, $(document).height() - $m.height() - 5);

              // Show the menu
              $(document).unbind('click');
              $m
                .css({ top: y, left: x })
                .fadeIn(o.fadeIn)
                .find('A')
                  .mouseover( function() {
                    $m.find('LI.hover').removeClass('hover');
                    $(this).parent().addClass('hover');
                  })
                  .mouseout( function() {
                    $m.find('LI.hover').removeClass('hover');
                  });

              if (o.onShow) o.onShow( this, {x: x - offset.left, y: y - offset.top, docX: x, docY: y} );

              // Keyboard
              $(document).keypress( function(e) {
                var $hover = $m.find('li.hover'),
                  $first = $m.find('li:first'),
                  $last  = $m.find('li:last');

                switch( e.keyCode ) {
                  case 38: // up
                    if( $hover.size() == 0 ) {
                      $last.addClass('hover');
                    } else {
                      $hover.removeClass('hover').prevAll('LI:not(.disabled)').eq(0).addClass('hover');
                      if( $hover.size() == 0 ) $last.addClass('hover');
                    }
                  break;
                  case 40: // down
                    if( $hover.size() == 0 ) {
                      $first.addClass('hover');
                    } else {
                      $hover.removeClass('hover').nextAll('LI:not(.disabled)').eq(0).addClass('hover');
                      if( $hover.size() == 0 ) $first.addClass('hover');
                    }
                  break;
                  case 13: // enter
                    $m.find('LI.hover A').trigger('click');
                  break;
                  case 27: // esc
                    $(document).trigger('click');
                  break
                }
              });

              // When items are selected
              $m.find('A').unbind('click');
              $m.find('LI:not(.disabled) A').click( function() {
                var checked = $(this).attr('checked');

                switch ($(this).attr('type')) // custom attribute
                {
                  case 'radio':
                    $(this).parent().parent().find('.checked').removeClass('checked').end().find('a[checked="checked"]').removeAttr('checked');
                    // break; // continue...
                  case 'checkbox':
                    if ($(this).attr('checked') || checked)
                    {
                      $(this).removeAttr('checked');
                      $(this).parent().removeClass('checked');
                    }
                    else
                    {
                      $(this).attr('checked', 'checked');
                      $(this).parent().addClass('checked');
                    }

                    //if ($(this).attr('hidemenu'))
                    {
                      $(".contextMenu").hide();
                    }
                    break;
                  default:
                    $(document).unbind('click').unbind('keypress');
                    $(".contextMenu").hide();
                    break;
                }
                // Callback
                if( o.onSelect )
                {
                  o.onSelect( $(this), $(target), $(this).attr('href'), {x: x - offset.left, y: y - offset.top, docX: x, docY: y} );
                }
                return false;
              });

              // Hide bindings
              setTimeout( function() { // Delay for Mozilla
                $(document).click( function() {
                  $(document).unbind('click').unbind('keypress');
                  $m.fadeOut(o.fadeOut);
                  return false;
                });
              }, 0);
            }
          });
        });

        // // Disable text selection
        // if( $.browser.mozilla ) {
        //   $m.each( function() { $(this).css({ 'MozUserSelect' : 'none' }); });
        // } else if( $.browser.msie ) {
        //   $m.each( function() { $(this).bind('selectstart.disableTextSelect', function() { return false; }); });
        // } else {
        //   $m.each(function() { $(this).bind('mousedown.disableTextSelect', function() { return false; }); });
        // }
        // Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
        el.add($('UL.contextMenu')).bind('contextmenu', function() { return false; });

      });
      return $(this);
    },
    // Destroy context menu(s)
    destroyContextMenu: function() {
      // Destroy specified context menus
      $(this).each( function() {
        // Disable action
        $(this).unbind('mousedown').unbind('mouseup');
      });
      return( $(this) );
    }

  });
})(jQuery);
    
    


/**
 * Context Menus in RaphaelJS: DEMO
 *
 * @blog    http://terryyoung.blogspot.com/2011/08/context-menus-for-raphaeljs.html
 * @copyright   Terry Young <terryyounghk [at] gmail.com>
 * @license   WTFPL Version 2 ( http://en.wikipedia.org/wiki/WTFPL )
 */

///////////////////////////////////////////////////////////////////////////////
// The demo

// $(document).ready(function() {

//   // 1. Create paper, sets, and shapes

//   var paper = Raphael('SVG_DND_HOLDER_1', 640, 200);
//   var set = paper.set(),
//     rect1 = paper.rect(10, 15, 64, 64, 5),
//     rect2 = paper.rect(10, 105, 64, 64, 5),
//     circle1 = paper.circle(150, 48, 30),
//     circle2 = paper.circle(150, 138, 30);

//   // 2. Viola

//   set .push(rect1, rect2, circle1, circle2)   // populate the Set
//     .style()                // Yes, it's that easy
//     .draggable();               // Yes, that's it


//   // 3. Prepare context menu onShow handler
    
//   function onContextMenuShow (target, pos)
//   {
//     var s = target.raphael;

//     switch (s.type)
//     {
//       case 'circle':
//         var r = s.attr('r'); // get current radius
//         $('#menuCircle')
//           .find('a[name="radius"]').removeAttr('checked')
//             .parent().removeClass('checked')
//             .end()
//           .end().
//           find('a[name="radius"][r="' + r + '"]').attr('checked', 'checked')
//             .parent().addClass('checked');
//         break;
//       case 'rect':
//         var w = s.getBBox().width; // get current width (size)
//         $('#menuRect')
//           .find('a[name="size"]').removeAttr('checked')
//             .parent().removeClass('checked')
//             .end()
//           .end()
//           .find('a[name="size"][w="' + w + '"]').attr('checked', 'checked')
//             .parent().addClass('checked');
//         break;
//     }

//     $('#menuRect, #menuCircle')
//       .find('a[name="style"]').removeAttr('checked')
//         .parent().removeClass('checked')
//         .end()
//       .end()
//       .find('a[name="style"][val="' + s.class + '"]').attr('checked', 'checked')
//         .parent().addClass('checked');
//   }

 
//   // 4. Prepare context menu item onSelect handler

//   function onContextMenuItemSelect (menuitem, target, href, pos)
//   {
//     var s = target.get(0).raphael;


//     if (menuitem.attr('name') == 'style')
//     {
//       var val = menuitem.attr('val');

//       switch (val)
//       {
//         case 'default':
//           s.style('base', val, {duration: 0, easing: false});
//           break;
//         case 'custom':
//           s.style('base', val, {duration: 300, easing: 'backOut'});
//           break;
//       }
//     }
//     else
//     {
//       switch (s.type)
//       {
//         case 'circle':
//           s.animate({r: menuitem.attr('r')}, 800, 'bounce');
//           break;
//         case 'rect':
//           var w = menuitem.attr('w');
//           s.animate({width: w, height: w}, 800, 'bounce');
//           break;
//       }
//     }
//   }


//   // 5. Attach context menus

//   $([rect1.node, rect2.node]).contextMenu({
//     menu:   'menuRect',
//     onShow:   onContextMenuShow,
//     onSelect: onContextMenuItemSelect
//   });

//   $([circle1.node, circle2.node]).contextMenu({
//     menu:   'menuCircle',
//     onShow:   onContextMenuShow,
//     onSelect: onContextMenuItemSelect
//   });

// });


