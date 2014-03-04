/**
 * @file
 * Core functionality.
 *
 * @TODO support non-webroot installs and hash based urls.
 * @TODO improve template support
 * @TODO 
 */

// Global settings.
var settings = $.ajax({url: '/settings/settings.yml', async: false});
settings = YAML.eval(settings.responseText);

/**
 * A list of content items.
 *
 * This provides easy chaining of operations on content.
 */
function List (items) {

  this.items = typeof items != 'undefined' ? items : [];

  /**
   * Find an item in the list which has the property value. Returns first match.
   *
   * @param string key
   *   Property to search for
   * @param {type} value
   *   Value of the property.
   * @returns Item
   */
  this.findItemBy = function (key, value) {
    for (item in this.items) {
      if (typeof item.key != 'undefined') {
        if (item.key == val) {
          return item;
        }
      }
    }
    return false;
  };

  /**
   * Find items in the list which have the property value. Returns all matches.
   *
   * @TODO this duplicates the same method in Content - can it be used here?
   *
   * @param string key
   *   Property to search for
   * @param string value
   *   Value of the property.
   * @returns List
   */
  this.findItemsBy = function(key, value) {
    var list = new List;
    for (index in this.items) {
      if (typeof this.items[index].key != 'undefined') {
        if (this.items[index].key == value) {
          list.items.push(this.items[index]);
        }
      }
    }
    return list;
  };

  /**
   * Order items in the list by the propery.
   *
   * @TODO should probably support more than decending order.
   *
   * @param string key
   * @returns List
   */
  this.orderBy = function(key) {
    var list = this.items.sort(function(a, b) {
      return  b.key - a.key;
    });
    return new List(list);
  };
}


/**
 * Content storage and manipulation.
 *
 * Provides a mechanism to fetch content, load content, and return content.
 *
 * @TODO should this.items be var items to prevent acccess?
 */
function Content () {
  this.items = new Array;
  var fileType = 'md';

  this.init = function() {
    this.getItemsList();
    return this;
  };

  this.findItemBy = function (key, value) {
    for (index in this.items) {
      if (typeof this.items[index][key] != 'undefined') {
        if (this.items[index][key] == value) {
          return this.items[index];
        }
      }
    }
    return false;
  };

  this.findItemsBy = function(key, value) {
    var list = new List;
    for (index in this.items) {
      if (typeof this.items[index][key] != 'undefined') {
        if (this.items[index][key] == value) {
          list.items.push(this.items[index]);
        }
      }
    }
    return list;
  };


  /**
   * Query an Apache server to get a list of content.
   *
   * @TODO make this extensible to support other data sources.
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
          var id = createAnId(path);
          if (! findItemBy('id', id)) {
            var item = new Item({id: id, path: path, date: date});
            items.push(item);
          }
        }
      });
    });
  };

  /**
   * Load all items in the system.
   *
   * @returns {undefined}
   */
  this.loadItems = function() {
    $.each(this.items, function (key, item) {
      if (! item.loaded) {
        item.load();
      }
    });
    return this;
  };

};


/**
 * A single content item.
 *
 * @TODO document the attributes of the object.
 */
function Item (data) {
  this.id = false;
  this.loaded = false;
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
   * Load a page template.
   *
   * @TODO how to handle if tempalte does not exist?
   *
   * @returns {undefined}
   */
  this.loadTemplate = function(){
    // Is this template defined yet?
    if (typeof window.templates[this.type] === 'undefined') {
      window.templates[this.type] = twig({
        id: this.type,
        href: "/templates/" + this.type + ".twig",
        async: false
      });
    }
  };

  /**
   * Basic template render function.
   *
   * @returns string
   */
  this.render = function () {
    this.loadTemplate();
    return twig({ ref: this.type }).render(this);
  };

};



/* *********************************************** */
/* Templating.                                     */
/* *********************************************** */

var templates = {};

// Note: for Safari and Chrome the load can't be async as the template is not
// available when twig.render() is called.
templates.home = twig({
  id: "home",
  href: "/templates/home.twig",
  async: false
});

templates.header = twig({
  id: "header",
  href: "/templates/header.twig",
  async: false
});

templates.footer = twig({
  id: "footer",
  href: "/templates/footer.twig",
  async: false
});


var headerHTML = twig({ ref: "header" }).render(settings);
$('body header').html(headerHTML);

var footerHTML = twig({ ref: "footer" }).render(settings);
$('body footer').html(footerHTML);




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


/* *********************************************** */
/* URL routing.                                    */
/* *********************************************** */
app = Davis(function () {

  var content = new Content();
  content.init();

  // Ensure that routing is loaded on page load.
  this.configure(function () {
    this.generateRequestOnPageLoad = true;
  });

  // Default behavior- get all posts.
  this.get('/', function (request) {
    var items = content.loadItems().findItemsBy('type', 'post').orderBy('sortDate');

    // Render the additional posts.
    var html = twig({ ref: "home" }).render({
      'posts' : items.items.slice(1),
      'featured': items.items.slice(0,1)[0]
    });
    $('#content').html(html);
  });

  // Display a single item.
  this.get('/:type/:id', function (request) {
    var output = content.findItemBy('id', request.params.id).load().render();
    $('#content').html(output);
  });

});



/* *********************************************** */
/* Run!                                            */
/* *********************************************** */

$(document).ready(function () {
  app.start();
});



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
