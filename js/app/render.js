/**
 * Providses templating features for things.
 *
 * @TODO flesh this
 */
define(['jquery', 'twig', 'config'], function ($, Twig, config) {

    // Here are some default templates to get started with.
    var templates = {
        home : Twig.twig({
            id: "home",
            href: config.template_directory + "home.twig",
            async: false
        }),

        detail : Twig.twig({
          id: "detail",
          href: config.template_directory + "detail.twig",
          async: false
        }),

        header : Twig.twig({
          id: "header",
          href: config.template_directory + "header.twig",
          async: false
        }),

        footer : Twig.twig({
          id: "footer",
          href: config.template_directory + "footer.twig",
          async: false
        })
    };

    /**
     * Load a specified template.
     *
     * @param {type} template
     * @returns {undefined}
     */
    function loadTemplate (template) {
      if (typeof templates[template] == 'undefined' || templates[template] === null) {
        templates[template] = Twig.twig({
          id: template,
          href: config.template_directory + '/' + template + ".twig",
          async: false
        });
      }
    }




  // Provide a custom truncation filter.
  Twig.extendFilter("truncateText", function(text, count) {
    var singular, tooLong = text.length > count;
    // Edge case where someone enters a ridiculously long string.
    text = tooLong ? text.substr(0, count - 1) : text;
    singular = (text.search(/\s/) === -1) ? true : false;
    if (!singular) {
      text = tooLong ? text.substr(0, text.lastIndexOf(' ')) : text;
    }
    return tooLong ? text + '&hellip;' : text;
  });



    /**
     * Basic template render function.
     *
     * @param object data
     *   Data to render in the template.
     * @param string template
     *   Name of the template to render.
     *
     * @returns string
     */
    return function (data, template) {
        var template = typeof template == 'undefined' ? data.type : template;
        loadTemplate(template);
        return Twig.twig({ref: template}).render(data);
    };



});