---
layout: article
title: This is not advisable.
date: 2014-01-04 21:06
description: This is madness I say.
author: Arthur


---

Sculprit is a thought experiment.

Sculprit is also a javascript powered templated content system which dynamically serves markdown formatted content.

Sculprit is (in theory) similar to static site generators like [Sculpin](https://sculpin.io/) and [Jekyll](http://jekyllrb.com/). It takes static content written in [markdown format](http://daringfireball.net/projects/markdown/) and displays them on the web. Unlike other Sculpin or Jekyll, Sculprit relies on the client's browser to build the site.

New content can simply be added as a markdown file to a content directory accessible on the web. Sculprit will automatically include your new content. Individual posts can specify what templates they use. Post authors, publish dates, titles, and descriptions are all supported in the basic templates. It is straight forward to add new variables for templates.

Sculprit uses:

* [Pagedown](http://code.google.com/p/pagedown/) - Markdown processing
* [davis.js](http://davisjs.com) - URL routing
* [Twig.js](https://github.com/justjohn/twig.js/wiki) - Templating
* [YAML.js](https://code.google.com/p/javascript-yaml-parser/) - Configuration

You can start using Sculprit by downloading this code into a web accessible directory and pointing your browser at it.

Source code: [Sculprit](https://github.com/arthur24b6/sculprit)
