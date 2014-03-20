/**
 * @file
 * Core functionality.
 *
 * @TODO support non-webroot installs and hash based urls.
 * @TODO improve template support
 * @TODO settings should be passed in.
 * @TODO implement the github
 */

// Global settings.
var settings = {
  content_directory: './content',
  template_directory: './templates',
  posts_path: '/post'
};



/**
 * Content storage and manipulation.
 *
 * Provides a mechanism to fetch content, load content, and return content.
 *
 * @TODO should this.items be var items to prevent acccess?
 */
function Sculprit (mode) {

  // Rebuild from the passed in data.
  // @TODO there should be a cleaner way to do this.
  if (typeof mode != 'undefined' && mode.constructor.name == 'Sculprit') {

    this.items = mode.items;
    this.itemTypes = mode.itemTypes;
    this.filterList = mode.filters;
    this.templates = mode.templates;
    this.loaded = mode.loaded;
  }

  // Initialize.
  else {
    this.items = new Array;
    this.itemTypes = new Array;
    this.filterList = new Array;
    this.templates = [];
    this.loaded = false;
  }

   // @TODO should be a setting.
   var fileType = 'md';


  this.init = function() {
    this.getItemsList();
    this.getTemplateList();
    this.load();
  };


  /**
   * Query an Apache server to get a list of content.
   *
   * @TODO make this extensible to support other data sources.
   * @TODO support sub directories.
   * @returns {undefined}
   */
  this.getItemsList = function() {
    var items = this.items;
    var findItemBy = this.findItemBy;
    $.ajax({url: settings.content_directory, async: false, data: 'C=M;O=D'})
    .done(function(data) {
      var listing = $(data).find('a');
      $(listing).each(function() {
        // Apache writes the URLs relative to the directory.
        var path = settings.content_directory + '/' + $(this).attr('href');
        var extension = path.substr((~-path.lastIndexOf(".") >>> 0) + 2);
        // Does the file extension match the content type?
        if (fileType == extension) {
          // Get the modified date. Apache list the entry like this:
          // <a href="2013-11-30-twig.md">2013-11-30-twig.md</a>      02-Dec-2013 10:20  182
          var date = $(this)[0].nextSibling.nodeValue;
          date = $.trim(date);
          // Now trim the file size off the end of it.
          date = $.trim(date.replace(/[\s\S][0-9]*$/, ''));
          // @TODO this should check for uniqueness.
          var item = new Item({id: createAnId(path), path: path, date: date});
          items.push(item);
        }
      });
    });
  };


  /**
   * Retrieve a list of the templates in the system.
   *
   * @returns {unresolved}
   */
  this.getTemplateList = function () {
    if (this.loaded) {
      return this.templates;
    }
    var self = this;
    $.ajax({url: settings.template_directory, async: false})
    .done(function(data) {
      var listing = $(data).find('a');
      $(listing).each(function() {
        if ($(this).attr('href').slice(-4) == 'twig') {
          // @TODO do something with the raw path?
          var path = settings.template_directory + '/' + $(this).attr('href');
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
  this.filters = function(data) {
    var filterList = this.filterList;

    if (! filterList) {
      $.each(this.items, function(key, value) {
        if ($.inArray(key, filterList) == -1) {
          filterList.push(key);
        }
      });
    }

    if (typeof data == 'undefined') {
      return filterList;
    }
    if ($.inArray(data, filterList)) {
      return true;
    }

    return false;
  };


  /**
   * Load all items in the system.
   *
   * @returns {undefined}
   */
  this.load = function() {
    var items = this.items;
    var itemTypes = this.itemTypes;
    $.each(this.items, function (key, item) {
      if (! item.loaded) {
        item.load();
      }
      // Track the type of items.
      if ($.inArray(item.type, itemTypes) == -1) {
        itemTypes.push(item.type);
      }
    });
    // Content has now been loaded.
    this.loaded = true;
  };


  /**
   * Returns a list of all the item types in the system.
   *
   * @returns {Array|List.getTypes.types}
   */
  this.getItemTypes = function() {
    return this.itemTypes;
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
  this.findItemBy = function (key, value) {
    var returnValue = false;
    $.each(this.items, function(index, item) {
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
  this.findItemsBy = function(property, values) {
    var Return = new Sculprit(this);
    // Convert the value from a string to an array.
    if (typeof values === 'string') {
      values = [values];
    }
    var items = new Array;
    $.each(Return.items, function(index, item) {
      if (typeof item[property] != 'undefined') {
        if ($.inArray(item[property], values) !== -1) {
          items.push(item);
        }
      }
    });
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
  this.filter = function(filters) {
    var Return = new Sculprit(this);
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
  this.orderBy = function(key, limit) {
    var Return = new Sculprit(this);
    var list = this.items.sort(function(a, b) {
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
  this.limit = function(limit) {
    var Return = new Sculprit(this);
    if (limit > 0) {
      Return.items = this.items.slice(0, limit);
    }
    return Return;
  };


  /**
   * Render items in the specified style.
   *
   * @TODO move Render() function in here.
   * @TODO where should the default template (teaser, list) be set?
   *
   * @param {type} template
   * @returns {List.renderList.list|List}
   */
  this.render = function(template) {
    if (typeof template == 'undefined') {
      var tempalte = false;
    }
    // Single item to display.
    if (this.items.length == 1) {
      // If template is not defined, use item.type for TYPE.twig
      if (! template) {
        // Assumes that the item.type is an existing template. This should be
        // addressed in Item().
        var template = this.items[0].type;
      }

      // Render a single item.
      return this.items[0].render(template);
    }
    // Multiple items
    else {
      var items = new Array;
      var template = template ? template : 'teaser' ;

      $.each(this.items, function (index, item) {
        items.push(item.render(template));
      });

      return Render({items: items}, 'list');
    }

  };



  /**
   * By default, load all content.
   *
   * @TODO this should be cleaned up
   */
  if (typeof mode == 'undefined') {
    var mode = true;
  }
  if (mode === true) {
    this.init();
    return new Sculprit(this);
  }

};


/**
 * A single content item.
 *
 * @TODO document the attributes of the object.
 */
function Item (data) {
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
    $.ajax({url: item.path, async: false, dataType: 'html'})
      .done(function(data) {
        item.url = createAURI(item);
        item.raw = data;

        // Get the configuration settings for this post.
        var configuration = data.match(/---([.\S\s]*?)---/);
        var options = YAML.eval(configuration[1]);
        $.each(options, function(key, value) {
          item[key] = value;
        });

        // Convert date to a sort date with a unified format. Apache may provide
        // returned dates with - which brakes strtotime().
        // @NOTE this is sort of being done above in getItemsList()
        item.sortDate = strtotime(item.date.replace(/-/igm, ' '));

        // Support for updated post times. Assumes a valid date format.
        if (typeof item.updated != 'undefined') {
          item.sortDate = strtotime(item.updated);
        }

        // Strip out the YAML markup from the text.
        var regex = /---[.\S\s]*?---/igm;
        item.text = data.replace(regex, '');

        // Convert text to Markdown.
        // @TODO this should be extensible.
        var converter = new Markdown.Converter();
        item.content = converter.makeHtml(item.text);

        item.loaded = true;
    });
    return this;
  } ;

  /**
   * Basic template render function.
   *
   * @returns string
   */
  this.render = function (template) {
    return Render(this, template);
  };

};



/* *********************************************** */
/* Templating                                      */
/* *********************************************** */

var templates = {};

templates.home = twig({
  id: "home",
  href: settings.template_directory + "/home.twig",
  async: false
});

templates.detail = twig({
  id: "detail",
  href: settings.template_directory + "/detail.twig",
  async: false
});

templates.header = twig({
  id: "header",
  href: settings.template_directory + "/header.twig",
  async: false
});

templates.footer = twig({
  id: "footer",
  href: settings.template_directory + "/footer.twig",
  async: false
});


/**
 * Custom text truncaction function.
 *
 * Code borrowed from: http://stackoverflow.com/a/20523002
 *
 * @param string text
 * @param int count
 */
Twig.extendFilter("truncateText", function(text, count) {
  var singular, tooLong = text.length > count;
  // Edge case where someone enters a ridiculously long string.
  text = tooLong ? text.substr(0, count - 1) : text;
  singular = (text.search(/\s/) === -1) ? true : false;
  if (!singular) {
    text = tooLong ? text.substr(0, text.lastIndexOf(' ')) : text;
  }
  return tooLong ? text + '&hellip;' : text;
});


/**
 * Basic template render function.
 *
 * @param object data
 *   Data to render in the template.
 * @param string template
 *   Name of the template to render.
 *
 * @returns string
 */
function Render (data, template) {
  var template = typeof template == 'undefined' ? data.type : template;
  loadTemplate(template);
  return twig({ref: template}).render(data);
};

/**
 * Load a tempalate.
 *
 * @param {type} template
 * @returns {undefined}
 */
function loadTemplate(template) {
   if (typeof window.templates[template] == 'undefined' || window.templates[template] === null) {
    window.templates[template] = twig({
      id: template,
      href: "/templates/" + template + ".twig",
      async: false
    });
  }
}

/* *********************************************** */
/* URL routing.                                    */
/* *********************************************** */


/**
 * Utility function to map a content file to a URI.
 *
 * @NOTE This functiona has to be unique and reversiable. Path is considered an
 * item's unique ID so any modifications to the created path have to be
 * reversable to find the original ID.
 *
 * @NOTE This function needs to be expanded in the future to handle
 * more complex URI structure to content, handle file extensions,
 * etc.
 */
function createAURI(item) {
  return item.type + '/' + item.id;
}

function createAnId(path) {
  var filename = path.replace(/^.*[\\\/]/, '');
  return filename.substr(0, filename.lastIndexOf('.'));
}






/**
 * PHP like date handling.
 *
 * Taken from: https://github.com/kvz/phpjs/blob/master/functions/datetime/strtotime.js
 */
function strtotime (text, now) {
    // Convert string representation of date and time to a timestamp
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/strtotime
    // +   original by: Caio Ariede (http://caioariede.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: David
    // +   improved by: Caio Ariede (http://caioariede.com)
    // +   bugfixed by: Wagner B. Soares
    // +   bugfixed by: Artur Tchernychev
    // +   improved by: A. Matías Quezada (http://amatiasq.com)
    // +   improved by: preuter
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
    // *     example 1: strtotime('+1 day', 1129633200);
    // *     returns 1: 1129719600
    // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
    // *     returns 2: 1130425202
    // *     example 3: strtotime('last month', 1129633200);
    // *     returns 3: 1127041200
    // *     example 4: strtotime('2009-05-04 08:30:00');
    // *     returns 4: 1241418600
    var parsed, match, year, date, days, ranges, len, times, regex, i;

    if (!text) {
        return null;
    }

    // Unecessary spaces
    text = text.replace(/^\s+|\s+$/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/[\t\r\n]/g, '')
        .toLowerCase();

    if (text === 'now') {
        return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
    }
    if (!isNaN(parsed = Date.parse(text))) {
        return parsed / 1000 | 0;
    }
    if (text === 'now') {
        return new Date().getTime() / 1000; // Return seconds, not milli-seconds
    }
    if (!isNaN(parsed = Date.parse(text))) {
        return parsed / 1000;
    }

    match = text.match(/^(\d{2,4})-(\d{2})-(\d{2})(?:\s(\d{1,2}):(\d{2})(?::\d{2})?)?(?:\.(\d+)?)?$/);
    if (match) {
        year = match[1] >= 0 && match[1] <= 69 ? +match[1] + 2000 : match[1];
        return new Date(year, parseInt(match[2], 10) - 1, match[3],
            match[4] || 0, match[5] || 0, match[6] || 0, match[7] || 0) / 1000;
    }

    date = now ? new Date(now * 1000) : new Date();
    days = {
        'sun': 0,
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6
    };
    ranges = {
        'yea': 'FullYear',
        'mon': 'Month',
        'day': 'Date',
        'hou': 'Hours',
        'min': 'Minutes',
        'sec': 'Seconds'
    };

    function lastNext(type, range, modifier) {
        var diff, day = days[range];

        if (typeof day !== 'undefined') {
            diff = day - date.getDay();

            if (diff === 0) {
                diff = 7 * modifier;
            }
            else if (diff > 0 && type === 'last') {
                diff -= 7;
            }
            else if (diff < 0 && type === 'next') {
                diff += 7;
            }

            date.setDate(date.getDate() + diff);
        }
    }
    function process(val) {
        var splt = val.split(' '), // Todo: Reconcile this with regex using \s, taking into account browser issues with split and regexes
            type = splt[0],
            range = splt[1].substring(0, 3),
            typeIsNumber = /\d+/.test(type),
            ago = splt[2] === 'ago',
            num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);

        if (typeIsNumber) {
            num *= parseInt(type, 10);
        }

        if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
            return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
        }
        if (range === 'wee') {
            return date.setDate(date.getDate() + (num * 7));
        }

        if (type === 'next' || type === 'last') {
            lastNext(type, range, num);
        }
        else if (!typeIsNumber) {
            return false;
        }
        return true;
    }

    times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
        '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
        '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)';
    regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?';

    match = text.match(new RegExp(regex, 'gi'));
    if (!match) {
        return false;
    }

    for (i = 0, len = match.length; i < len; i++) {
        if (!process(match[i])) {
            return false;
        }
    }

    return (date.getTime() / 1000);
}
