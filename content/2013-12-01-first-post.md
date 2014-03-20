---
type: article
title: This is not advisable.
date: 2014-03-14 21:06
description: This is madness I say.
author: Arthur
variable: New value.
variable2: Another new value.
sticky: true

---

Sculprit is a javascript powered templated content system which dynamically serves markdown formatted content.

You can see Sculprit in action at [http://sculprit.24b6.net/](http://sculprit.24b6.net/).

Sculprit is (in theory) similar to static site generators like [Sculpin](https://sculpin.io/) and [Jekyll](http://jekyllrb.com/). It takes static content written in [markdown format](http://daringfireball.net/projects/markdown/) and displays them on the web. Unlike other Sculpin or Jekyll, Sculprit relies on the client's browser to build the site.

New content can simply be added as a [markdown file](https://github.com/arthur24b6/sculprit/blob/master/content/2013-12-01-first-post.md) to a [content directory](https://github.com/arthur24b6/sculprit/tree/master/content) accessible on the web. Sculprit will automatically include your new content. Individual posts can specify what [templates](https://github.com/arthur24b6/sculprit/tree/master/templates) they use. Post authors, publish dates, titles, and descriptions are all supported in the basic templates. It is straight forward to add new variables for templates.

Sculprit uses:

* [Pagedown](http://code.google.com/p/pagedown/) - Markdown processing
* [davis.js](http://davisjs.com) - URL routing
* [Twig.js](https://github.com/justjohn/twig.js/wiki) - templating
* [YAML.js](https://code.google.com/p/javascript-yaml-parser/) - configuration for application and posts

You can start using Sculprit by downloading this code into a web root and pointing your browser at it.

Requirements:
* Server must allow URL rewriting in an .htaccess file to index.html
* Server must allow directory listings
* Sculprit must reside in a web root

Source code: [Sculprit](https://github.com/arthur24b6/sculprit)
