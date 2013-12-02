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
    $.each(items, function(key, value) {
      posts.push(getAPost(value));
    });

    // Render the full first post.
    var postHTML = twig({ ref: "post" }).render($(posts).first()[0]);
    $('#content').html(postHTML);

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