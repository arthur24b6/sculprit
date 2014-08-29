require(["jquery", "twig", "routie", 'render', "numberString", "sculprit", "parser"], function($, Twig, routie, render, numberString, Sculprit, parser) {


  // Initial page load, render all sculprit content.
  parser($('body'));

  /* *********************************************** */
  /* Application routing                             */
  /* *********************************************** */

  routie('', function() {

    parser(render({}, 'home'));


  });

  routie(':type/:id', function(type, id) {
    // Get the requested item.
    // var item = content.findItemBy('id', id);
    // $('#content').html(render(item, 'detail'));
    // SculpritClassRender();
  });






});




