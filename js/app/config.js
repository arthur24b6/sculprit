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
    // Allow the broweser to cache content files. Off during development.
    content_cache: false,
    template_directory: baseURL + 'templates/',
    // Allow the browser to cache template files. Off during development.
    template_cache: false,
    debug: true,
    contentFileExtension: 'md'
  };
});