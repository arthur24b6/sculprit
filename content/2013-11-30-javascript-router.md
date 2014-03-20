---
type: post
title: Content URLs
date: 2014-01-01 00:05
updated: 2014-01-03 00:05
author: Arthur
description: Dynamic URL routing with DavisJS

---

Sculprit uses [davis.js](http://davisjs.com) router to handle incoming links to content. It maps the in bound URLs to the file names of content in the *posts* directory. Sculprit basically uses the filename as the key and has the path to the content baked in.

There is an added benefit that davis.js loads content using HTML5's history API so that it can load content without page loads. This makes subsequent page loads much quicker after the inital page load.