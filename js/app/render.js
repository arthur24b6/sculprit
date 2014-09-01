/**
 * Providses templating features for things.
 *
 * @TODO flesh this
 */
define(['jquery', 'twig', 'config'], function ($, Twig, config) {

  // Array of all twig templates that have been loaded.
  var templates = {};

  /**
   * Provide a custom truncation filter.
   * @param string text
   *   The text to truncate.
   * @param int count
   *   Character count to runcate at.
   *
   * @returns string
   *   Truncated string.
   */
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
   * Load a specified template.
   *
   * @param  string template
   *   Name of the template to load.
   */
  function loadTemplate (template) {
    if (typeof templates[template] == 'undefined' || templates[template] === null) {
      templates[template] = Twig.twig({
        id: template,
        href: config.template_directory + template + ".twig",
        async: false
      });
    }
  }

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