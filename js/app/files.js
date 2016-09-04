/**
 * Get a listing of files from a specified directory. Note that this uses
 * syncronous requests to get the file list to ensure that content is discovered
 * before other processsing happens.
 */

define(['jquery', 'config'], function ($, config) {
    if (typeof config.contentFileExtension == 'undefined') {
      config.contentFileExtension = 'md';
    }

    if (typeof config.webServer == 'apache') {
      // set the function to apache
    }

    function createAnId (url) {
      var filename = url.replace(/^.*[\\\/]/, '');
      return filename.substr(0, filename.lastIndexOf('.'));
    }

    function extensionsMatch(filepath, allowedExtension) {
      var extension = filepath.substr((~-filepath.lastIndexOf(".") >>> 0) + 2);
      if (allowedExtension == '*' || typeof allowedExtension == 'undefined' || allowedExtension == extension) {
        return true;
      }
    }

    return {
      fileList : function(url, extension, callback) {
        var items = [];
        var files = [];

        function getFilesApache(url, extension) {
          $.ajax({url: url, async: false, data: 'C=M;O=D'})
            .done(function(data) {
              var listing = $(data).find('a');
              $(listing).each(function() {
                // Apache writes the URLs relative to the directory.
                var path = url + $(this).attr('href');
                // Does the file extension match the content type?
                if (extensionsMatch(path, extension)) {
                  // Get the modified date. Apache list the entry like this:
                  // <a href="2013-11-30-twig.md">2013-11-30-twig.md</a>      02-Dec-2013 10:20  182
                  var date = $(this)[0].nextSibling.nodeValue;
                  date = $.trim(date);
                  // Now trim the file size off the end of it.
                  date = $.trim(date.replace(/[\s\S][0-9]*$/, ''));
                  files.push({id: createAnId(path), path: path, date: date});
                }
              });
              callback(files);
          });
        }


        // @TODO abstract the github base url here
        function getFilesGithub(url, extension) {
          var base = "https://api.github.com/repos/arthur24b6/sculprit/contents";
          url = base + url;
          $.ajax({url: url, async: false, dataType: 'json'})
            .done(function(data) {
              $.each(data, function(key, val) {
                if (extensionsMatch(val.path, extension)) {
                  files.push({id: createAnId(val.path), path: val.download_url, date: ''});
                }
              });
              callback(files);
            });
        }

      return getFilesApache(url, config.contentFileExtension, callback);
    },

    getFile : function (url, callback) {
      $.ajax({url: url, async: false, dataType: 'html'})
        .done(function(data) {callback(data);});
    }

  }

});