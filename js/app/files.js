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
      getFileList : function(url, extension, callback) {
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
                  files.push({id: createAnId(path), path: path});
                }
              });
              callback(files);
          });
        }


        // @TODO abstract the github base url here
        function getFilesGithub(url, extension) {
          var base = "https://api.github.com/repos/arthur24b6/sculprit/contents";
          url = base + url.replace(/\/$/, "");
          console.log(url);
          $.ajax({url: url, async: false, dataType: 'json'})
            .done(function(data) {
              $.each(data, function(key, val) {
                if (extensionsMatch(val.path, extension)) {
                  files.push({id: createAnId(val.path), path: val.download_url});
                }
              });
              callback(files);
            });
        }
console.log('Are we logging');
      return getFilesGithub(url, extension, callback);
    },

    getFile : function (url, callback) {
      $.ajax({url: url, async: false, dataType: 'html'})
        .done(function(data) {callback(data);});
    }

  }

});