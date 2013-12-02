---
layout: post
title: "Post order"
date: 2013-11-01 00:01
description: How new posts are displayed.

---

In order to display the latest posts, Sculprit reads the directory list of the **/content** directory (by default) and uses this list as the sort order of the posts (files). It would be better to use **post.date** to sort things, but for ease of implementation, modified date it is.

If Apache doesn't let you do fancy indexing, it will create problems- it will then default to file created date for the sort order.