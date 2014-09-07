/**
 * @file
 * Provides a jQuery function to render content into a container.
 */

define(["jquery", "sculprit", "render", "numberString", "config"], function($, Sculprit, render, numberString, config) {

  // Ensure that Sculprit exists.
  if (typeof content == 'undefined') {
    var content = Sculprit();
  }

  if (typeof config.defaultTemplate == 'undefined') {
    config.defaultTemplate = 'detail';
  }


  /**
   * Parse the DOM and add content to all items.
   *
   * @param mixed data
   *   Either a jQuery object or a string of HTML to be parsed. If this is a
   *   string, content will be inserted into the container id before it is parsed.
   *
   */
  $.fn.parser = function (data) {
    var item = {};

    // If a string of html is passed in figure out if it is a
    if (typeof data == 'string') {

      // If the string is a template, just render the template in to the container.
      if (content.isTemplate(data)) {
        $(this).html(render({}, data));
      }

      // If the string is an ID, render the id with default template
      else if (item = content.findItemBy('id', data)) {
        var output = render(item, config.defaultTemplate);
        $(this).html(output);
      }

      // Raw data has been passed, insert it so it can be parsed.
      else {
        $(this).html(data);
      }

    }

    // An array of data has been passed. Assume that it is
    // * an item
    // * an {id: id, template: template}
    // * {ids:ids, template: template}
    // @TODO
    else if (typeof data == 'array') {

    }


    $('[data-sculprit]', this).each(function() {

      // Get all of the arguments and remove the identifier.
      var arguments = $.trim($(this).attr('data-sculprit'));
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
          if (content.isTemplate(argument)) {
            template = argument;
            return true;
          }
        }

        // Any additional attributes to select by?
        if (content.filters(argument) ) {
          filters.push(argument);
        }

      });

      if (typeof config.debug != 'undefined') {
        console.log('Element class: ' + $(this).attr('data-sculprit'));
        console.log('Item type: ' + types +'. Filtered by: ' + filters +'. Limit to: ' + limit +'. Rendered with: ' + template + '.');
        var debug = 'Content items: ';
        $.each(content.findItemsBy('type', types).filter(filters).orderBy('sortDate').limit(limit).items, function(key, item) {
          debug += item.path +  '';
        });
        console.log(debug);
      }

      var output = content.findItemsBy('type', types).filter(filters).orderBy('sortDate').limit(limit).render(template);
      $(this).html(output);

    });

  }

});
