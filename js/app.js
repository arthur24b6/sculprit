/**
 * Initialize the prototype content
 * @type Content
 *
 * @TODO support non-webroot installs and hash based urls.
 * @TODO support tool tips
 *   Show path to content
 *   Show template
 *   Show render teplate
 */

// Initialize content.
var content = new Sculprit();


app = Davis(function () {

  // Ensure that routing is loaded on page load.
  this.configure(function () {
    this.generateRequestOnPageLoad = true;
  });


  // Default behavior- get all posts.
  this.get('/', function (request) {
    $('#content').html(twig({ ref: "home" }).render({})) ;
  });

  // Display a single item.
  // @TODO support different kinds of detail pages.
  this.get('/:type/:id', function (request) {
    // Get the requested item.
    var item = content.findItemBy('id', request.params.id);
    $('#content').html(twig({ ref: "detail" }).render(item));
  });

  // Rerender the class based templating after every route change.
  this.after(function () {SculpritClassRender();});

});



/* *********************************************** */
/* Run!                                            */
/* *********************************************** */

$(document).ready(function () {
  //Davis.extend(Davis.hashRouting({ prefix: "!", forceHashRouting: true }));
  app.start();
});


/**
 * Search for html elements that use the templating system and insert content.
 *
 * An html element should implement this system in the following way:
 * <div class="template post"></div>
 * Which will render a single post item through the post.twig template.
 *
 * <div class="template posts"></div>
 * Will render 10 post items through the teaser.twig and then through list.twig
 *
 * <div class="template posts--articles five"></div>
 * Will render the first five post and article items through teaser.twig and
 * then through list.twig.
 */

function SculpritClassRender() {

// What is the class that is being used to identify the template containers?
var className = 'sculprit';

$('.' + className).each(function() {

  // Strip out the selector.
  var classes = $(this).attr('class').replace(className, '');
  classes = $.trim(classes);
  classes = classes.split(/\s+/);

  var types = [];
  var template = false;
  var limit = false;
  var filters = [];

  // Break the classes down to individual class names.
  $.each(classes, function (index, className) {

    // Check to see that the type of items to return has not been set already.
    if (types.length < 1) {

      // Check to see if this is a single type of item to return.
      if ($.inArray(className, content.getItemTypes()) !== -1) {
        types = [className];
        limit = 1;
        return true;
      }

      // Check to see if this is a plural of an item type.
      else if (isPlural(className, content.getItemTypes())) {
        types = [isPlural(className, content.getItemTypes())];
        // @TODO should this be the default # or should content() define that?
        limit = 0;
        return true;
      }

      // Check to see if there are multiple types being requested. When multiple
      // types are passed only plurals are supported.
      else if (className.split('--').length > 1) {
        var names = className.split('--');
        // These should always be plurals so test for those.
        $.each(names, function(index, value) {
          var itemType = isPlural(value, content.getItemTypes());
          if (itemType) {
            types.push(itemType);
            // @TODO should this be the default # or should content() define that?
            limit = 0;
          }
        });
        return true;
      }
    }


    // Check to see if this is a limit argument. Assumes that no CSS classes are
    // using number names. Overrides default limits.
    if (wordNumber(className) && ! limit ) {
      limit = wordNumber(className);
      return true;
    }


    // Check to see if this is a request for a template type. The item type(s)
    // must be set before the template value is set.
    if (! template && types.length > 0) {
      if ($.inArray(className, content.getTemplateList()) !== -1) {
        template = className;
        return true;
      }
    }

    // Any additional attributes to select by?
    if (content.filters(className) ) {
      filters.push(className);
    }


  });

  var output = content.findItemsBy('type', types).filter(filters).orderBy('sortDate').limit(limit).render(template);
  $(this).html(output);
});

};


/**
 * Utility function to check to see if a class name is a plural of an item type.
 *
 * @TODO this belongs in Sculprit()
 *
 * @param string name
 * @param array itemTypes
 * @returns string or boolean
 */
function isPlural(name, itemTypes) {
   var singular = name.slice(0, -1);
   if ($.inArray(singular, itemTypes) !== -1) {
     return singular;
   }
   return false;
 }



/**
 * Parse word numbers into an integer.
 *
 * @param stringstring
 * @returns int
 */
function wordNumber(string) {
  var Small = {
      'zero': 0,
      'one': 1,
      'two': 2,
      'three': 3,
      'four': 4,
      'five': 5,
      'six': 6,
      'seven': 7,
      'eight': 8,
      'nine': 9,
      'ten': 10,
      'eleven': 11,
      'twelve': 12,
      'thirteen': 13,
      'fourteen': 14,
      'fifteen': 15,
      'sixteen': 16,
      'seventeen': 17,
      'eighteen': 18,
      'nineteen': 19,
      'twenty': 20,
      'thirty': 30,
      'forty': 40,
      'fifty': 50,
      'sixty': 60,
      'seventy': 70,
      'eighty': 80,
      'ninety': 90
  };

  var Magnitude = {
      'thousand':     1000,
      'million':      1000000,
      'billion':      1000000000,
      'trillion':     1000000000000,
      'quadrillion':  1000000000000000,
      'quintillion':  1000000000000000000,
      'sextillion':   1000000000000000000000,
      'septillion':   1000000000000000000000000,
      'octillion':    1000000000000000000000000000,
      'nonillion':    1000000000000000000000000000000,
      'decillion':    1000000000000000000000000000000000,
  };


  function feach(w) {
      var x = Small[w];
      if (x != null) {
          g = g + x;
      }
      else if (w == "hundred") {
          g = g * 100;
      }
      else {
          x = Magnitude[w];
          if (x != null) {
              n = n + g * x
              g = 0;
          }
          else {
            return false;
          }
      }
  }

  var a, n, g;
  a = string.toString().split(/[\s-]+/);
  n = 0;
  g = 0;
  a.forEach(feach);
  return n + g;
}