/**
 * @file
 * Provides the a content item object.
 *
 * This will parse a path provided on the constructed object for YAML and
 * markdown content.
 *
 */

define(['jquery', 'yamlDown', 'render', 'config'], function($, yamlDown, render, config) {


    /**
     * Utility function to map a content file to a URL.
     *
     * @NOTE this should be moved somewhere else.
     *
     * @NOTE This function has to be unique and reversiable. Path is considered an
     * item's unique ID so any modifications to the created path have to be
     * reversable to find the original ID.
     *
     * @NOTE This function needs to be expanded in the future to handle
     * more complex URI structure to content, handle file extensions,
     * etc.
     */
    function createAURI (item) {
        return '#' + item.type + '/' + item.id;
    }

    return function (data) {
      this.id = false;
      this.loaded = false;

      // @TODO this is the default type. Should this be configurable?
      this.type = 'post';

      // Date will default to the Apache (or other) listing data. If a post supplies
      // one it will override this value.
      this.date = false;

      // Sort date is a special case to handle an item with an updated date, date,
      // or no date.
      this.sortDate = false;

      if (typeof data != 'undefined') {
        for (var key in data) {
          this[key] = data[key];
        };
      }

      /**
       * Read and parse the file from the source.
       *
       * @returns this
       */
      this.load = function() {
        if (this.loaded) {
          return;
        }
        var item = this;
        /*
        return require(['text!../../content/2013-11-30-javascript-router.md', 'yamlDown'], function(item, yamlDown) {
            $.each(yamlDown(item), function(key, value) {
                item[key] = value;
            });
            return item;
        });

        console.log(data);
        */

        var url = item.path;
        if (typeof config.debug != 'undefined') {
          url = url + '?nocache=' + (new Date()).getTime();
        }

        // Use async loading to ensure that item is fully populated before it is
        // returned.
        // @TODO use require(['text!... or consider $.when(....).done(....)
        return $.ajax({url: url, async: false, dataType: 'html'})
          .done(function(data) {
            $.each(yamlDown(data), function(key, value) {
               item[key] = value;
            });
            item.url = createAURI(item);
            return item;
        });

      } ;

      /**
       * Basic template render function.
       *
       * @returns string
       */
      this.render = function (template) {
        return render(this, template);
      };

    };

});