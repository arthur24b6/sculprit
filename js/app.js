/**
 * @file
 * Core functionality.
 */


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
    var postsHTML = twig({ ref: "posts" }).render({'posts' : posts});
    $('#content').html(postsHTML);
  });

  // Display a single post.
  this.get('/post/:post', function (req) {
    var path = getAPath(req);
    var post = getAPost(path);
    var postHTML = twig({ ref: "post" }).render(post);
    $('#content').html(postHTML);
  });

});


/* *********************************************** */
/* Templating.                                     */
/* *********************************************** */

var postTemplate = twig({
  id: "post",
  href: "/templates/post.twig",
});

var postsTemplate = twig({
  id: "posts",
  href: "/templates/posts.twig",
});



/* *********************************************** */
/* Run!                                            */
/* *********************************************** */
$(document).ready(function () {
  app.start();
});