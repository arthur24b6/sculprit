requirejs(["jquery", "routie", "parser"], function($, routie, parser) {

  // Initial page load, render all sculprit content on the main page.
console.log('Preparse');
  $('body').parser();
  console.log('parse complete');

  /* *********************************************** */
  /* Application routing                             */
  /* *********************************************** */

  routie('', function() {
     $('#content').parser('home');
  });

  routie(':type/:id', function(type, id) {
     $('#content').parser(id);
  });

});

