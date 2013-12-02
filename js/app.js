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

// Note: for Safari and Chrome the load can't be async as the template is not
// available when twig.render() is called.
var postTemplate = twig({
  id: "post",
  href: "/templates/post.twig",
  async: false
});

var postsTemplate = twig({
  id: "posts",
  href: "/templates/posts.twig",
  async: false
});

var header = twig({
  id: "header",
  href: "/templates/header.twig",
  async: false
});

var footer = twig({
  id: "footer",
  href: "/templates/footer.twig",
  async: false
});

var headerHTML = twig({ ref: "header" }).render(settings);
$('#header').html(headerHTML);

var footerHTML = twig({ ref: "footer" }).render(settings);
$('#footer').html(footerHTML);


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
      // @todo support post.updated_date ?
      var date = strtotime(post.date);
      post.sort_date = date;

      posts.push(post);
    });


    // Sort the posts by the date_sort.
    posts.sort(function(a, b) {return a.date_sort - b.date_sort});

    // Get the first post.
    var featured_post = posts.slice(0,1);

    // Render the full first post.
    var featured = twig({ ref: "post" }).render(featured_post[0]);
    $('#content').html(featured);


    // Get the remainder of the posts.
    posts = posts.slice(1);

    // Render the additional posts.
    var postsHTML = twig({ ref: "posts" }).render({'posts' : posts});
    $('#content').append(postsHTML);
  });




  // Display a single post.
  this.get(settings.posts_path + '/:post', function (req) {
    var path = getAPath(req);
    var post = getAPost(path);
    var postHTML = twig({ref: 'post'}).render(post);
    $('#content').html(postHTML);
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

    // ECMAScript 5 only
    //if (!match.every(process))
    //    return false;

    return (date.getTime() / 1000);
}
