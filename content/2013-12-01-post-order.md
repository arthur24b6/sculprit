---
layout: post
title: Sculprit post ordering
date: 2014-01-01 00:05
description: How post order is displayed.
updated: 2014-01-02 00:01
author: Arthur
---


Sculprit orders posts by post date. This date can be set in the post with the **date: YYYY-MM-DD HH:MM** attribute in the post.

Sculprit will also respect **updated: YYYY-MM-DD HH:MM** attribute in the post. If neither of these attributes is present, Sculprit will rely on the file modified date that Apache reports.

While the demo files have dates in their post titles these won't have any baring on the post order.
