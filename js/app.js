/**
 * Initialize the prototype content
 * @type Content
 *
 * @TODO support non-webroot installs and hash based urls.
 * @TODO support tool tips
 *   Show path to content
 *   Show template
 *   Show render teplate
 */


// Here are the scripts that need to be loaded:
requirejs.config({
    "baseUrl": "js/vendor",
    "paths": {
      "app": "../app",

      "jsyaml": "js-yaml.min",
      "jquery": "jquery.min",
      "twig": "twig",
      "routie": "routie.min",

      "text": "text",
      "markdownConverter": "Markdown.Converter",

      "sculprit" : "../app/sculprit",
      "config": "../app/config",
      "strtotime": "../app/strtotime",
      "files": "../app/files",
      "yamlDown": "../app/yamlDown",
      "contentItem": "../app/contentItem",
      "render": "../app/render",
      "numberString": "../app/numberString",
      "parser": "../app/parser",
      "logger": "../app/logger",

      // Prevent caching. Remove this if your are not developing.
      urlArgs: "?q=A"+ Math.random() + "&bust=" + (new Date()).getTime()
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);

