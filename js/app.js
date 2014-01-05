/**
 * @file
 * Core functionality.
 */


// Global settings.
var settings = $.ajax({url:'/settings/settings.yml', async: false});
settings = YAML.eval(settings.responseText);

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
/* Content templating.                             */
/* *********************************************** */

/**
 * Utility function to get template for post.
  *
 * @param post
 * @returns string
 */
function getPostTemplate(post) {
  var type = (typeof post.layout !== 'undefined') ? post.layout : settings.default_layout;
  // Load the tempalte if needed.
  getTemplate(type);
  return type;
}


/**
 * Utility function to load templates by name.
 *
 * @TODO should check to see if the template file actually exists.
 *
 * @param {type} type
 * @returns {undefined}
 */
function getTemplate(type) {
  // Is this template defined yet?
  if (typeof window.templates[type] === 'undefined') {
    window.templates[type] = twig({
      id: type,
      href: "/templates/" + type + ".twig",
      async: false
    });
  }
}


/**
 * Render a single post with the correct template.
 *
 * @param post
 * @returns HTML
 */
function renderPost(post) {
  var template = getPostTemplate(post);
  return twig({ ref: template }).render(post);
}


/* *********************************************** */
/* URL routing.                                    */
/* *********************************************** */


/**
 * Get all the posts in the specified directory.
 *
 * @returns array of post URIs
 */
function getAllPosts(directory, type) {
  var posts = {};
  // Get the directory listing. Note that the sorting is being done by Apache's
  // list options. If this isn't supported on the server this won't work.
  $.ajax({url: settings.content_directory, async: false, data: 'C=M;O=D'})
    .done(function(data) {
      var items = $(data).find('a');
      $(items).each(function() {
        // Apache writes the URLs relative to the directory.
        var uri = settings.content_directory + '/' + $(this).attr('href');
        var extension = uri.substr((~-uri.lastIndexOf(".") >>> 0) + 2);

        // Does the file extension match the content type?
        if (settings.content_type == extension) {

          // Get the modified date. Apache list the entry like this:
          // <a href="2013-11-30-twig.md">2013-11-30-twig.md</a>      02-Dec-2013 10:20  182
          var date = $(this)[0].nextSibling.nodeValue;
          date = $.trim(date);
          // Now trim the file size off the end of it.
          date = $.trim(date.replace(/[\s\S][0-9]*$/, ''));

          // Check to see if this post already exists. If so, use the URI as the
          // key.
          if (typeof posts[date] === 'undefined') {
            key = date;
          }
          else {
            key = uri;
          }
          posts[key] = uri;
        }
      });

    });
  return posts;
}


/**
 * Get a post and retun an object with body text markdown rendered.
 *
 * @TODO needs to handle tags listing correctly in the metadata of
 * posts
 *
 * @returns post
 */
function getAPost(uri) {
  var post = {};

  $.ajax({url: uri, async: false, dataType: 'html'})
    .done(function(data) {

      // Get the configuration settings for this post.
      var configuration = data.match(/---([.\S\s]*?)---/);
      var options = YAML.eval(configuration[1]);
      $.each(options, function(key, value) {
        post[key] = value;
      });

      // Strip out the YAML markup from the text.
      var regex = /---[.\S\s]*?---/igm;
      data = data.replace(regex, '');

      // Convert text to Markdown.
      var converter = new Markdown.Converter();
      post.text = converter.makeHtml(data);

      // Create a read more link.
      post.more = '<a href="' + createAURI(uri) + '">Read more</a>';
    });

  return post;
}


/**
 * Utility function to map a content file to a URI.
 *
 * @NOTE This function needs to be expanded in the future to handle
 * more complex URI structure to content, handle file extensions,
 * etc.
 */
function createAURI(path) {
  // Get the filename.
  var filename = path.replace(/^.*[\\\/]/, '');
  return settings.posts_path + '/' + filename.substr(0, filename.lastIndexOf('.'));
}


/**
 * Utility function to map a URL request to the content file path.
 *
 * @NOTE This function needs to be expanded in the future to handle
 * more complex URI structures to content, handle file extensions,
 * etc.
 *
 * @param {type} req
 * @returns {undefined}
 */
function getAPath(request) {
  // Right now we know that /post/ID will map to /posts/ID.md
  return settings.content_directory + '/' + request.params['post'] + '.md';
}


/* *********************************************** */
/* URL routing.                                    */
/* *********************************************** */
app = Davis(function () {

  // Ensure that routing is loaded on page load.
  this.configure(function () {
    this.generateRequestOnPageLoad = true;
  });

  // Default behavior- get all posts.
  this.get('/', function (req) {
    var posts = [];
    var items = getAllPosts();
    $.each(items, function(modified, uri) {
      // Get the individual post.
      post = getAPost(uri);

      // Build a date from the post if there is one.
      if (typeof post.date === 'undefined') {
        post.date = modified;
      }

      // Convert date to a sort date with a unified format.
      var date = strtotime(post.date);
      post.date_sort = date;

      // Support for updated post times.
      if (typeof post.updated !== 'undefined') {
        var date = strtotime(post.updated);
        post.date_sort = date;
      }

      posts.push(post);
    });

    // Sort the posts by the date_sort.
    posts.sort(function(a, b) { return  b.date_sort - a.date_sort });

    // Get the first post.
    var featured_post = posts.slice(0,1)[0];

    // Get the remainder of the posts.
    posts = posts.slice(1);

    // Render the additional posts.
    var html = twig({ ref: "home" }).render({
      'posts' : posts,
      'featured': featured_post
    });
    $('#content').html(html);
  });


  // Display a single post.
  this.get(settings.posts_path + '/:post', function (req) {
    var path = getAPath(req);
    var post = getAPost(path);
    console.log(post);
    $('#content').html(renderPost(post));
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
