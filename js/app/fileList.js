/**
 * Get a listing of files from a specified directory.
 *
 * @TODO remove dependency on jquery
 */

define(['jquery', 'config', 'contentItem'], function ($, config, contentItem) {
    // @TODO this needs to be abstracted somewhere.
    function createAnId (url) {
        var filename = url.replace(/^.*[\\\/]/, '');
        return filename.substr(0, filename.lastIndexOf('.'));
    }

    return function(url, callback) {
        var items = [];

        if (typeof config.contentFileExtension == 'undefined') {
          config.contentFileExtension = 'md';
        }

        $.ajax({url: url, async: false, data: 'C=M;O=D'})
            .done(function(data) {
              var listing = $(data).find('a');
              $(listing).each(function() {
                // Apache writes the URLs relative to the directory.
                var path = url +  $(this).attr('href');
                var extension = path.substr((~-path.lastIndexOf(".") >>> 0) + 2);
                // Does the file extension match the content type?
                if (config.contentFileExtension == extension) {
                  // Get the modified date. Apache list the entry like this:
                  // <a href="2013-11-30-twig.md">2013-11-30-twig.md</a>      02-Dec-2013 10:20  182
                  var date = $(this)[0].nextSibling.nodeValue;
                  date = $.trim(date);
                  // Now trim the file size off the end of it.
                  date = $.trim(date.replace(/[\s\S][0-9]*$/, ''));

                  var item = new contentItem({id: createAnId(path), path: path, date: date});
                  items.push(item);
                }
              });

        });

        return callback(items);
    };

});