---
layout: post
title: Javascript URL router
date: 2013-11-01 00:01
author: Arthur
---

This project uses the [davis.js](http://davisjs.com) router to handle incoming links to content. It maps the in bound URLs to the file names of content in the *posts* directory. Sculprit basically uses the filename as the key and has the path to the content baked in.

There is an added benefit that davis.js loads content using HTML5's history API so that it can load content without page loads.