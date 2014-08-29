/**
 * @file
 * Default configuration
 */

define('config', function() {
  // @TODO is this needed? Is there a function in requirejs that gets the current path?
  var baseURL = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/')) + '/';
  return {
    baseURL: baseURL,
    content_directory: baseURL + 'content/',
    template_directory: baseURL + 'templates/',
    debug: true,
    contentFileExtension: 'md'
  };
});