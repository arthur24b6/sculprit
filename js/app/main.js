require(["jquery", "routie", 'render', "sculprit", "parser"], function($, routie, render, Sculprit, parser) {


  // Initial page load, render all sculprit content.
  parser($('body'));

  /* *********************************************** */
  /* Application routing                             */
  /* *********************************************** */

  routie('', function() {
    parser(render({}, 'home'));
  });

  routie(':type/:id', function(type, id) {

    // Ensure that Sculprit exists.
    if (typeof content == 'undefined') {
      var content = Sculprit();
    }

    $('#content').html(content.findItemBy('id', id).render('detail'));

  });


});




