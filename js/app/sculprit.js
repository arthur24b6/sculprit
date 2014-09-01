/**
 * @file
 * Core functionality.
 *
 * @TODO improve template support
 * @TODO implement the github
 */


define(["jquery", "twig", "jsyaml", "strtotime", "yamlDown", "config", 'fileList', "render"], function($, Twig, jsyaml, strtotime, yamlDown, config, fileList, render) {

/**
 * Content storage and manipulation.
 *
 * Provides a mechanism to fetch content, load content, and return content.
 *
 * @param mode mixed
 *   One of: undefined, array, Sculprit. When an array is passed it is a
 *   configuration
 *
 * @TODO should this.items be var items to prevent acccess?
 */
function Sculprit(mode) {

  var sculprit = {};

  // Rebuild from the passed in data.
  // @TODO there should be a cleaner way to do this.
  if (typeof mode == 'object' ) {
    sculprit.items = mode.items;
    sculprit.itemTypes = mode.itemTypes;
    sculprit.filterList = mode.filters;
    sculprit.templates = mode.templates;
    sculprit.loaded = mode.loaded;
  }
  // Initialize.
  else {
    sculprit.items = new Array;
    sculprit.itemTypes = new Array;
    sculprit.filterList = new Array;
    sculprit.templates = [];
    sculprit.loaded = false;
    sculprit.config = config;
  }


  sculprit.init = function() {
    console.log('Creating new sculprit');
    sculprit.getItemsList();
    sculprit.getTemplateList();
    sculprit.load();
  };


  /**
   * Provides settings.
   *
   * @param key string
   *   A key value to return.
   */
  function settings(key) {
    if (typeof key == 'undefined') {
      return sculprit.config;
    }
    else {
      return sculprit.config[key];
    }
  }

  /**
   * Query an Apache server to get a list of content.
   *
   * @TODO make this extensible to support other data sources.
   * @TODO support sub directories.
   * @returns {undefined}
   */
  sculprit.getItemsList = function() {
      var items = {};
      var test = sculprit;
      var list = fileList(settings('content_directory'), function(items) {
          test.items = items;
          return test;
      });
  };


  /**
   * Retrieve a list of the templates in the system.
   *
   * @returns {unresolved}
   */
  sculprit.getTemplateList = function () {
    if (sculprit.loaded) {
      return sculprit.templates;
    }
    var self = this;
    $.ajax({url: settings('template_directory'), async: false})
    .done(function(data) {
      var listing = $(data).find('a');
      $(listing).each(function() {
        if ($(this).attr('href').slice(-4) == 'twig') {
          // @TODO do something with the raw path?
          var path = settings('template_directory') + '/' + $(this).attr('href');
          // Remove the .twig extension.
          self.templates.push($(this).attr('href').slice(0, -5));
        }
      });
    });
  };


  /**
   * Check item attributes to see if variable is an attribute.
   *
   * @returns boolean
   */
  sculprit.filters = function(data) {

    if (sculprit.filterList.length == 0) {
      $.each(sculprit.items, function(key, value) {

        if ($.inArray(key, sculprit.filterList) == -1) {
          sculprit.filterList.push(key);
        }
      });
    }

    if (typeof data == 'undefined') {
      return sculprit.filterList;
    }
    if ($.inArray(data, sculprit.filterList)) {
      return true;
    }

    return false;
  };


  /**
   * Load all items in the system.
   *
   * @returns {undefined}
   */
  sculprit.load = function() {
    var items = sculprit.items;
    var itemTypes = sculprit.itemTypes;
    $.each(sculprit.items, function (key, item) {
      if (! item.loaded) {
        item.load();
      }
      // Track the type of items.
      if ($.inArray(item.type, itemTypes) == -1) {
        itemTypes.push(item.type);
      }
    });
    // Content has now been loaded.
    sculprit.loaded = true;
    $(document).trigger('sculpritReady');
  };


  /**
   * Returns a list of all the item types in the system.
   *
   * @returns {Array|List.getTypes.types}
   */
  sculprit.getItemTypes = function() {
    return sculprit.itemTypes;
  };


 /**
   * Find an item in the list which has the property value.
   *
   * Use orderBy() before this if order matters.
   *
   * @param string key
   *   Property to search for
   * @param {type} value
   *   Value of the property.
   * @returns Item or false.
   */
  sculprit.findItemBy = function (key, value) {
    var returnValue = false;
    $.each(sculprit.items, function(index, item) {
      if (typeof item[key] != 'undefined') {
        if (item[key] == value) {
          returnValue = item;
          // Return false to exit the jQuery loop.
          return false;
        }
      }
    });
    return returnValue;
  };


  /**
   * Find items in the list which have the property value. Returns all matches.
   *
   * @TODO can this support a cascade of options where:
   *   property as string = return items where the property and a value exists
   *   array of properties = return items where the properties are set
   *   array property/value = return items where item property value matches
   *   array of properties/values = return items where item property values
   *     all conditions
   *
   *
   * @param string property
   *   Property to search for
   * @param string values
   *   Value of the property to search for. Can be an array.
   *
   * @returns Sculprit object
   */
  sculprit.findItemsBy = function(property, values) {
    // Convert the value from a string to an array.
    if (typeof values === 'string') {
      values = [values];
    }
    var items = new Array;
    $.each(sculprit.items, function(index, item) {
      if (typeof item[property] != 'undefined') {
        if ($.inArray(item[property], values) !== -1) {
          items.push(item);
        }
      }
    });

    var Return = new Sculprit(sculprit);
    Return.items = items;

    return Return;
  };


  /**
   * Filter a set of results by an existing attribute.
   *
   * @TODO should refactor findItemsBy() to support this.
   *
   * @param array filters
   * @returns {Sculprit.findItemsBy.Return|Sculprit|Sculprit.filter.Return}
   */
  sculprit.filter = function(filters) {
    var Return = new Sculprit(sculprit);
    if (filters.length > 0) {
      var items = new Array;
      // Check each item.
      $.each(Return.items, function(index, item) {
        // Check each filter
        $.each(filters, function(index, value) {
          if (typeof item[value] != 'undefined' && item[value]) {
            items.push(item);
            return true;
          }
        });
      });
      Return.items = items;
    }
    return Return;
  };


  /**
   * Order items in the list by the propery.
   *
   * @TODO should probably support more than decending order.
   *
   * @param string key
   * @param int limit
   *   Optional, limit the returns.
   * @returns List
   */
  sculprit.orderBy = function(key, limit) {
    var Return = new Sculprit(this);
    var list = sculprit.items.sort(function(a, b) {
      return  b.key - a.key;
    });

    if (typeof limit != 'undefined' || limit !== 0) {
      list = list.slice(0, limit);
    }
    Return.items = list;
    return Return;
  };


  /**
   * Return a subset of the items.
   *
   * @param int limit
   * @returns {Sculprit.limit.Return|Sculprit}
   */
  sculprit.limit = function(limit) {
    var Return = new Sculprit(this);
    if (limit > 0) {
      Return.items = sculprit.items.slice(0, limit);
    }
    return Return;
  };


  /**
   * Render items in the specified style.
   *
   * @TODO shouldn't this stuff be in the renderer?
   *
   * @param string template
   * @returns {List.renderList.list|List}
   */
  sculprit.render = function(template) {
    if (typeof template == 'undefined') {
      var template = false;
    }
    // Single item to display.
    if (sculprit.items.length == 1) {
      // If template is not defined, use item.type for TYPE.twig
      if (! template) {
        // Assumes that the item.type is an existing template. This should be
        // addressed in Item().
        var template = sculprit.items[0].type;
      }

      // Render a single item.
      return sculprit.items[0].render(template);
    }
    // Multiple items
    else {
      var items = new Array;
      // @TODO default template should probably be configurable.
      var template = template ? template : 'teaser' ;

      $.each(sculprit.items, function (index, item) {
        items.push(item.render(template));
      });

      return render({items: items}, 'list');
    }

  };

    /**
     * Utility function to map a content file to a URI.
     *
     * @NOTE This function has to be unique and reversiable. Path is considered an
     * item's unique ID so any modifications to the created path have to be
     * reversable to find the original ID.
     *
     * @NOTE This function needs to be expanded in the future to handle
     * more complex URI structure to content, handle file extensions,
     * etc.
     */
    sculprit.createAURI = function (item) {
        return '#' + item.type + '/' + item.id;
    }

    sculprit.createAnId = function(path) {
        var filename = path.replace(/^.*[\\\/]/, '');
        return filename.substr(0, filename.lastIndexOf('.'));
    }


    /**
     * Test a string to see if it is a plural of any content item types.
     *
     * @param string string
     *
     * @returns {Boolean}
     */
    sculprit.isPlural = function (string) {
        var singular = string.slice(0, -1);
        if ($.inArray(singular, sculprit.getItemTypes()) !== -1) {
            return singular;
        }
        return false;
    }


    /**
     * By default, load all content.
     *
     * @TODO this should be cleaned up
     */
    if (typeof mode == 'undefined') {
      var mode = true;
    }
    if (mode === true) {
      sculprit.init();
    }

    return sculprit;

};

return Sculprit;


});
