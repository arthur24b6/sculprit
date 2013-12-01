/**
 * @file
 * Provides the file handling for content.
 */


/**
 * Get all the posts in the specified directory.
 *
 * @returns array of post URIs
 */
function getAllPosts(directory, type) {
  // Path to index.
  path = typeof path !== 'undefined' ? path : '/posts';
  // By default look for .md files
  type = typeof type !== 'undefined' ? type : 'md';

  var posts = {};

  // Get the directory listing.
  $.ajax({url: path, async: false})
    .done(function(data) {
      var items = $(data).find('li a');
      $(items).each(function() {
        var uri = path + '/' + $(this).attr('href');
        var extension = uri.substr((~-uri.lastIndexOf(".") >>> 0) + 2);
        // Ignore the parent directory if no extension has been set.
        if (type == '*' && uri != '/') {
          posts[uri] = uri;
        }
        else if (type == extension) {
          posts[uri] = uri;
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

  $.ajax({url: uri, async: false})
    .done(function(data) {

      // Find the header in the markdown files that may have metadata
      // that should be used.
      var options = /^---([.\s\S]*?)---/igm.exec(data);
      if (typeof options[1] !== 'undefined') {
        // Split the options into an array.
        options = options[1].split(/\r?\n/);
        $.each(options, function (key, value) {
          // Make sure that there is a value for this item.
          if (value) {
            // Split the item and watch for whitespace.
            var item = value.split(/:[.|\s\S](.+)?/);
            if (typeof item[1] !== 'undefined') {
              // Strip start/end quotes.
              item[1] = item[1].replace(/(^")|("$)/g, '');

              post[item[0]] = item[1];
            }
          }
          post.more = '<a href="' + createAURI(uri) + '">Read more</a>';
        });

        // Strip out the metadata markup from the text.
        var regex = /---[.\S\s]*?---/igm;
        data = data.replace(regex, '');
      }

      var converter = new Markdown.Converter();
      post.text = converter.makeHtml(data);
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
  return '/post/' + filename.substr(0, filename.lastIndexOf('.'));
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
  return '/posts/' + request.params['post'] + '.md';
}