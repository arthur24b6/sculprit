/*
YAML parser for Javascript
Author: Diogo Costa

This program is released under the MIT License as follows:

Copyright (c) 2011 Diogo Costa (costa.h4evr@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @name YAML
 * @namespace
*/

define(function() {

var YAML=function(){function e(a){return{parent:null,length:0,level:a,lines:[],children:[],addChild:function(a){this.children.push(a),a.parent=this,++this.length}}}function f(){var a;try{a=new XMLHttpRequest}catch(b){for(var c=new Array("MSXML2.XMLHTTP.5.0","MSXML2.XMLHTTP.4.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"),d=!1,e=0;e<c.length&&!d;e++)try{a=new ActiveXObject(c[e]),d=!0}catch(b){}if(!d)throw new Error("Unable to create XMLHttpRequest.")}return a}function g(a,b){var c=f();c.onreadystatechange=function(){if(4==this.readyState||200==this.status){var a=this.responseText;b(YAML.eval(a))}},c.open("GET",a),c.send()}function h(b){var h,c=d.regLevel,f=d.invalidLine,g=b.split("\n"),i=0,j=0,k=[],l=new e(-1),m=new e(0);l.addChild(m);var n=[],o="";k.push(m),n.push(i);for(var p=0,q=g.length;q>p;++p)if(o=g[p],!o.match(f)){if(i=(h=c.exec(o))?h[1].length:0,i>j){var r=m;m=new e(i),r.addChild(m),k.push(m),n.push(i)}else if(j>i){for(var s=!1,t=n.length-1;t>=0;--t)if(n[t]==i){m=new e(i),k.push(m),n.push(i),null!=k[t].parent&&k[t].parent.addChild(m),s=!0;break}if(!s)return a.push("Error: Invalid indentation at line "+p+": "+o),void 0}m.lines.push(o.replace(d.trim,"")),j=i}return l}function i(a){a=a.replace(d.trim,"");var b=null;if("true"==a)return!0;if("false"==a)return!1;if(".NaN"==a)return Number.NaN;if("null"==a)return null;if(".inf"==a)return Number.POSITIVE_INFINITY;if("-.inf"==a)return Number.NEGATIVE_INFINITY;if(b=a.match(d.dashesString))return b[1];if(b=a.match(d.quotesString))return b[1];if(b=a.match(d["float"]))return parseFloat(b[0]);if(b=a.match(d.integer))return parseInt(b[0]);if(isNaN(b=Date.parse(a))){if(b=a.match(d.single_key_value)){var c={};return c[b[1]]=i(b[2]),c}if(b=a.match(d.array)){for(var e=0,f=" ",c=[],g="",h=!1,j=0,k=b[1].length;k>j;++j){if(f=b[1][j],"'"==f||'"'==f){if(h===!1){h=f,g+=f;continue}if("'"==f&&"'"==h||'"'==f&&'"'==h){h=!1,g+=f;continue}}else if(h!==!1||"["!=f&&"{"!=f)if(h!==!1||"]"!=f&&"}"!=f){if(h===!1&&0==e&&","==f){c.push(i(g)),g="";continue}}else--e;else++e;g+=f}return g.length>0&&c.push(i(g)),c}if(b=a.match(d.map)){for(var e=0,f=" ",c=[],g="",h=!1,j=0,k=b[1].length;k>j;++j){if(f=b[1][j],"'"==f||'"'==f){if(h===!1){h=f,g+=f;continue}if("'"==f&&"'"==h||'"'==f&&'"'==h){h=!1,g+=f;continue}}else if(h!==!1||"["!=f&&"{"!=f)if(h!==!1||"]"!=f&&"}"!=f){if(h===!1&&0==e&&","==f){c.push(g),g="";continue}}else--e;else++e;g+=f}g.length>0&&c.push(g);for(var l={},j=0,k=c.length;k>j;++j)(b=c[j].match(d.key_value))&&(l[b[1]]=i(b[2]));return l}return a}return new Date(b)}function j(a){for(var b=a.lines,c=a.children,d=b.join(" "),e=[d],f=0,g=c.length;g>f;++f)e.push(j(c[f]));return e.join("\n")}function k(a){for(var b=a.lines,c=a.children,d=b.join("\n"),e=0,f=c.length;f>e;++e)d+=k(c[e]);return d}function l(c){for(var e=null,f={},g=null,h=null,m=null,n=-1,o=[],p=!0,q=0,r=c.length;r>q;++q)if(-1==n||n==c[q].level){o.push(q),n=c[q].level,g=c[q].lines,h=c[q].children,m=null;for(var s=0,t=g.length;t>s;++s){var u=g[s];if(e=u.match(d.key)){var v=e[1];if("-"==v[0]&&(v=v.replace(d.item,""),p&&(p=!1,"undefined"==typeof f.length&&(f=[])),null!=m&&f.push(m),m={},p=!0),"undefined"!=typeof e[2]){var w=e[2].replace(d.trim,"");if("&"==w[0]){var x=l(h);null!=m?m[v]=x:f[v]=x,b[w.substr(1)]=x}else if("|"==w[0])null!=m?m[v]=k(h.shift()):f[v]=k(h.shift());else if("*"==w[0]){var y=w.substr(1),z={};if("undefined"==typeof b[y])a.push("Reference '"+y+"' not found!");else{for(var A in b[y])z[A]=b[y][A];null!=m?m[v]=z:f[v]=z}}else">"==w[0]?null!=m?m[v]=j(h.shift()):f[v]=j(h.shift()):null!=m?m[v]=i(w):f[v]=i(w)}else null!=m?m[v]=l(h):f[v]=l(h)}else{if(u.match(/^-\s*$/)){p&&(p=!1,"undefined"==typeof f.length&&(f=[])),null!=m&&f.push(m),m={},p=!0;continue}if(e=u.match(/^-\s*(.*)/)){null!=m?m.push(i(e[1])):(p&&(p=!1,"undefined"==typeof f.length&&(f=[])),f.push(i(e[1])));continue}}}null!=m&&(p&&(p=!1,"undefined"==typeof f.length&&(f=[])),f.push(m))}for(var q=o.length-1;q>=0;--q)c.splice.call(c,o[q],1);return f}function m(a){var b=l(a.children);return b}function n(a){var b,c=a.split("\n"),e=d.comment;for(var f in c)(b=c[f].match(e))&&"undefined"!=typeof b[3]&&(c[f]=b[0].substr(0,b[0].length-b[3].length));return c.join("\n")}function o(d){a=[],b=[],c=(new Date).getTime();var e=n(d),f=h(e),g=m(f);return c=(new Date).getTime()-c,g}var a=[],b=[],c=0,d={regLevel:new RegExp("^([\\s\\-]+)"),invalidLine:new RegExp("^\\-\\-\\-|^\\.\\.\\.|^\\s*#.*|^\\s*$"),dashesString:new RegExp('^\\s*\\"([^\\"]*)\\"\\s*$'),quotesString:new RegExp("^\\s*\\'([^\\']*)\\'\\s*$"),"float":new RegExp("^[+-]?[0-9]+\\.[0-9]+(e[+-]?[0-9]+(\\.[0-9]+)?)?$"),integer:new RegExp("^[+-]?[0-9]+$"),array:new RegExp("\\[\\s*(.*)\\s*\\]"),map:new RegExp("\\{\\s*(.*)\\s*\\}"),key_value:new RegExp("([a-z0-9_-][ a-z0-9_-]*):( .+)","i"),single_key_value:new RegExp("^([a-z0-9_-][ a-z0-9_-]*):( .+?)$","i"),key:new RegExp("([a-z0-9_-][ a-z0-9_-]+):( .+)?","i"),item:new RegExp("^-\\s+"),trim:new RegExp("^\\s+|\\s+$"),comment:new RegExp("([^\\'\\\"#]+([\\'\\\"][^\\'\\\"]*[\\'\\\"])*)*(#.*)?")};return{fromURL:g,eval:o,getErrors:function(){return a},getProcessingTime:function(){console.log('hi'); console.dir(c); return c}}}();


});