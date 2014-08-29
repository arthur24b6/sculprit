/**
 * @file
 * Parses a mixed YAML and Markdown content.
 *
 * Takes a markdown formated content with YAML configuration data and returns an
 * object with the parsed data.
 *
 * Provides yamlDown(url)
 */
define(['jquery',  "jsyaml", 'markdownConverter', "strtotime" ], function($, jsyaml, markdownConverter, strtotime) {
    return function(data) {

        var item = {raw: data};

        // Get the configuration settings for this post.
        var configuration = data.match(/---([.\S\s]*?)---/);
        var options = jsyaml.load(configuration[1]);
        $.each(options, function(key, value) {
            item[key] = value;
        });

        // Convert date to a sort date with a unified format. Apache may provide
        // returned dates with - which breaks strtotime().
        if (typeof item.date != 'undefined') {
            item.sortDate = strtotime(item.date.replace(/-/igm, ' '));
        }

        // Support for updated post times. Assumes a valid date format.
        if (typeof item.updated != 'undefined') {
            item.sortDate = strtotime(item.updated);
        }

        // Strip out the YAML markup from the text.
        var regex = /---[.\S\s]*?---/igm;
        item.text = data.replace(regex, '');

        // Convert text to Markdown.
        item.content = markdownConverter.makeHtml(item.text);

        item.loaded = true;

        return item;
    };

});
