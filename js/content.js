/**
 * @file
 * Provides the file handling for content.
 */


/**
 * Get all the posts in the specified directory.
 *
 * @TODO figure out sort order?
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

  $.ajax({url: uri, async: false})
    .done(function(data) {

      var options = YAML.eval(data);
      $.each(options, function(key, value) {
        post[key] = value;
      });

      // Create a read more link.
      post.more = '<a href="' + createAURI(uri) + '">Read more</a>';

      // Strip out the YAML markup from the text.
      var regex = /---[.\S\s]*?---/igm;
      data = data.replace(regex, '');

      // Convert text to Markdown.
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