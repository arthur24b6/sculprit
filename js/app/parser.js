/**
 * @file
 * Search for html elements that use the templating system and insert content.
 *
 * @TODO pass settings to make this configurable.
 * @TODO ensure that a Sculprit has already been enstantiated.
 *
 * An html element should implement this system in the following way:
 * <div class="sculprit post"></div>
 * Which will render a single post item through the post.twig template.
 *
 * <div class="sculprit posts"></div>
 * Will render 10 post items through the teaser.twig and then through list.twig
 *
 * <div class="sculprit posts--articles five"></div>
 * Will render the first five post and article items through teaser.twig and
 * then through list.twig.
 */

define(["jquery", "sculprit", "render", "numberString"], function($, Sculprit, render, numberString) {


  /**
   * Parse the DOM and add content to all items.
   *
   * @param mixed element
   *   Either a jQuery object or a string of HTML to be parsed. If this is a
   *   string, content will be inserted into the container id before it is parsed.
   * @param string container
   *   Element id to insert the parsed content into. Only valid when a string is
   *   passed in.
   *
   */
  return function (element, container) {
    // The default content container to parse is #content. This is only relevant
    // when a string of html is passed.
    if (typeof container == 'undefined') {
      var container = '#content';
    }

    // If a string of html is passed in, appened it to the container so it can
    // be parsed.
    if (typeof element == 'string') {
      $(container).html(element);
    }

    // If a jquery object is passed in, use it as the container to parse.
    if (typeof element == 'object') {
      container = element;
    }

    if (typeof content == 'undefined') {
      var content = Sculprit();
    }


    // @TODO this selector should be definable.
    $('.sculprit', container).each(function() {

      // Get all of the arguments and remove the identifier.
      var arguments = $.trim($(this).attr('class')).replace('sculprit', '');
      // Create an array and filter out any empty items.
      arguments = arguments.split(/\s+/).filter(function(n){ return n != ''; });

      var types = [];
      var template = false;
      var limit = false;
      var filters = [];

      // Break the arguments down.
      $.each(arguments, function (index, argument) {

        // Check to see that the type of items to return has not been set already.
        if (types.length < 1) {

          // Check to see if this is a single type of item to return.
          if ($.inArray(argument, content.getItemTypes()) !== -1) {
            types = [argument];
            limit = 1;
            return true;
          }

          // Check to see if this is a plural of an item type.
          else if (content.isPlural(argument)) {
            types = [content.isPlural(argument)];
            // @TODO should this be the default # or should content() define that?
            limit = 0;
            return true;
          }

          // Check to see if there are multiple types being requested. When multiple
          // types are passed only plurals are supported.
          else if (argument.split('--').length > 1) {
            var names = argument.split('--');
            // These should always be plurals so test for those.
            $.each(names, function(index, value) {
              var itemType = content.isPlural(value);
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
        if (numberString(argument) && ! limit ) {
          limit = numberString(argument);
          return true;
        }


        // Check to see if this is a request for a template type. The item type(s)
        // must be set before the template value is set.
        if (! template && types.length > 0) {
          if ($.inArray(argument, content.getTemplateList()) !== -1) {
            template = argument;
            return true;
          }
        }

        // Any additional attributes to select by?
        if (content.filters(argument) ) {
          filters.push(argument);
        }

      });


      console.log('Element class: ' + $(this).attr('class'));
      console.log('Item type: ' + types +'. Filtered by: ' + filters +'. Limit to: ' + limit +'. Rendered with: ' + template + '.');
      var output = content.findItemsBy('type', types).filter(filters).orderBy('sortDate').limit(limit).render(template);

      $(this).html(output);

    });

  }


});