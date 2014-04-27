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

/* *********************************************** */
/* Run!                                            */
/* *********************************************** */

$(document).ready(function () {

  routie('', function() {
    $('#content').html(twig({ ref: "home" }).render({})) ;
    SculpritClassRender();
  });

  routie(':type/:id', function(type, id) {
    // Get the requested item.
    var item = content.findItemBy('id', id);
    $('#content').html(twig({ ref: "detail" }).render(item));
    SculpritClassRender();
  });

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