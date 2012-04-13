/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
// Underscore.js 1.3.3
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function r(a,c,d){if(a===c)return 0!==a||1/a==1/c;if(null==a||null==c)return a===c;a._chain&&(a=a._wrapped);c._chain&&(c=c._wrapped);if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=l.call(a);if(e!=l.call(c))return!1;switch(e){case "[object String]":return a==""+c;case "[object Number]":return a!=+a?c!=+c:0==a?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==
c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if("object"!=typeof a||"object"!=typeof c)return!1;for(var f=d.length;f--;)if(d[f]==a)return!0;d.push(a);var f=0,g=!0;if("[object Array]"==e){if(f=a.length,g=f==c.length)for(;f--&&(g=f in a==f in c&&r(a[f],c[f],d)););}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return!1;for(var h in a)if(b.has(a,h)&&(f++,!(g=b.has(c,h)&&r(a[h],c[h],d))))break;if(g){for(h in c)if(b.has(c,h)&&!f--)break;
g=!f}}d.pop();return g}var s=this,I=s._,o={},k=Array.prototype,p=Object.prototype,i=k.slice,J=k.unshift,l=p.toString,K=p.hasOwnProperty,y=k.forEach,z=k.map,A=k.reduce,B=k.reduceRight,C=k.filter,D=k.every,E=k.some,q=k.indexOf,F=k.lastIndexOf,p=Array.isArray,L=Object.keys,t=Function.prototype.bind,b=function(a){return new m(a)};"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=b),exports._=b):s._=b;b.VERSION="1.3.3";var j=b.each=b.forEach=function(a,
c,d){if(a!=null)if(y&&a.forEach===y)a.forEach(c,d);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(d,a[e],e,a)===o)break}else for(e in a)if(b.has(a,e)&&c.call(d,a[e],e,a)===o)break};b.map=b.collect=function(a,c,b){var e=[];if(a==null)return e;if(z&&a.map===z)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});if(a.length===+a.length)e.length=a.length;return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(A&&
a.reduce===A){e&&(c=b.bind(c,e));return f?a.reduce(c,d):a.reduce(c)}j(a,function(a,b,i){if(f)d=c.call(e,d,a,b,i);else{d=a;f=true}});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(B&&a.reduceRight===B){e&&(c=b.bind(c,e));return f?a.reduceRight(c,d):a.reduceRight(c)}var g=b.toArray(a).reverse();e&&!f&&(c=b.bind(c,e));return f?b.reduce(g,c,d,e):b.reduce(g,c)};b.find=b.detect=function(a,
c,b){var e;G(a,function(a,g,h){if(c.call(b,a,g,h)){e=a;return true}});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(C&&a.filter===C)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;if(D&&a.every===D)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,
a,g,h)))return o});return!!e};var G=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(E&&a.some===E)return a.some(c,d);j(a,function(a,b,h){if(e||(e=c.call(d,a,b,h)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;if(q&&a.indexOf===q)return a.indexOf(c)!=-1;return b=G(a,function(a){return a===c})};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=
function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&
(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var b=[],d;j(a,function(a,f){d=Math.floor(Math.random()*(f+1));b[f]=b[d];b[d]=a});return b};b.sortBy=function(a,c,d){var e=b.isFunction(c)?c:function(a){return a[c]};return b.pluck(b.map(a,function(a,b,c){return{value:a,criteria:e.call(d,a,b,c)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c===void 0?1:d===void 0?-1:c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};
j(a,function(a,b){var c=e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:b.isArray(a)||b.isArguments(a)?i.call(a):a.toArray&&b.isFunction(a.toArray)?a.toArray():b.values(a)};b.size=function(a){return b.isArray(a)?a.length:b.keys(a).length};b.first=b.head=b.take=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,
0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=null&&!d?i.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,
e=[];a.length<3&&(c=true);b.reduce(d,function(d,g,h){if(c?b.last(d)!==g||!d.length:!b.include(d,g)){d.push(g);e.push(a[h])}return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,true))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a){var c=b.flatten(i.call(arguments,1),true);return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=
i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d){d=b.sortedIndex(a,c);return a[d]===c?d:-1}if(q&&a.indexOf===q)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(F&&a.lastIndexOf===F)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){if(arguments.length<=
1){b=a||0;a=0}for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-a)/d),0),f=0,g=Array(e);f<e;){g[f++]=a;a=a+d}return g};var H=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,i.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=i.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(i.call(arguments)));H.prototype=a.prototype;var b=new H,g=a.apply(b,e.concat(i.call(arguments)));return Object(g)===g?g:b}};b.bindAll=function(a){var c=
i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var e=c.apply(this,arguments);return b.has(d,e)?d[e]:d[e]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(null,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};b.throttle=function(a,c){var d,e,f,g,h,i,j=b.debounce(function(){h=
g=false},c);return function(){d=this;e=arguments;f||(f=setTimeout(function(){f=null;h&&a.apply(d,e);j()},c));g?h=true:i=a.apply(d,e);j();g=true;return i}};b.debounce=function(a,b,d){var e;return function(){var f=this,g=arguments;d&&!e&&a.apply(f,g);clearTimeout(e);e=setTimeout(function(){e=null;d||a.apply(f,g)},b)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments,0));
return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};b.keys=L||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var c=[],d;for(d in a)b.has(a,d)&&(c[c.length]=d);return c};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&
c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]=b[d]});return a};b.pick=function(a){var c={};j(b.flatten(i.call(arguments,1)),function(b){b in a&&(c[b]=a[b])});return c};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return r(a,b,[])};b.isEmpty=
function(a){if(a==null)return true;if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(b.has(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)=="[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return l.call(a)=="[object Arguments]"};b.isArguments(arguments)||(b.isArguments=function(a){return!(!a||!b.has(a,"callee"))});b.isFunction=function(a){return l.call(a)=="[object Function]"};
b.isString=function(a){return l.call(a)=="[object String]"};b.isNumber=function(a){return l.call(a)=="[object Number]"};b.isFinite=function(a){return b.isNumber(a)&&isFinite(a)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};b.isDate=function(a){return l.call(a)=="[object Date]"};b.isRegExp=function(a){return l.call(a)=="[object RegExp]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.has=function(a,
b){return K.call(a,b)};b.noConflict=function(){s._=I;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};b.result=function(a,c){if(a==null)return null;var d=a[c];return b.isFunction(d)?d.call(a):d};b.mixin=function(a){j(b.functions(a),function(c){M(c,b[c]=a[c])})};var N=0;b.uniqueId=
function(a){var b=N++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var u=/.^/,n={"\\":"\\","'":"'",r:"\r",n:"\n",t:"\t",u2028:"\u2028",u2029:"\u2029"},v;for(v in n)n[n[v]]=v;var O=/\\|'|\r|\n|\t|\u2028|\u2029/g,P=/\\(\\|'|r|n|t|u2028|u2029)/g,w=function(a){return a.replace(P,function(a,b){return n[b]})};b.template=function(a,c,d){d=b.defaults(d||{},b.templateSettings);a="__p+='"+a.replace(O,function(a){return"\\"+n[a]}).replace(d.escape||
u,function(a,b){return"'+\n_.escape("+w(b)+")+\n'"}).replace(d.interpolate||u,function(a,b){return"'+\n("+w(b)+")+\n'"}).replace(d.evaluate||u,function(a,b){return"';\n"+w(b)+"\n;__p+='"})+"';\n";d.variable||(a="with(obj||{}){\n"+a+"}\n");var a="var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n"+a+"return __p;\n",e=new Function(d.variable||"obj","_",a);if(c)return e(c,b);c=function(a){return e.call(this,a,b)};c.source="function("+(d.variable||"obj")+"){\n"+a+"}";return c};
b.chain=function(a){return b(a).chain()};var m=function(a){this._wrapped=a};b.prototype=m.prototype;var x=function(a,c){return c?b(a).chain():a},M=function(a,c){m.prototype[a]=function(){var a=i.call(arguments);J.call(a,this._wrapped);return x(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];m.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;(a=="shift"||a=="splice")&&e===0&&delete d[0];return x(d,
this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];m.prototype[a]=function(){return x(b.apply(this._wrapped,arguments),this._chain)}});m.prototype.chain=function(){this._chain=true;return this};m.prototype.value=function(){return this._wrapped}}).call(this);
/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20120318
 */
(function(H){function P(P,ca){function l(a){return function(c){var e=this._t;return!e||!e._a?null:a.call(this,c)}}this.flashVersion=8;this.debugFlash=this.debugMode=!1;this.consoleOnly=this.useConsole=!0;this.waitForWindowLoad=!1;this.bgColor="#ffffff";this.useHighPerformance=!1;this.html5PollingInterval=this.flashPollingInterval=null;this.flashLoadTimeout=1E3;this.wmode=null;this.allowScriptAccess="always";this.useFlashBlock=!1;this.useHTML5Audio=!0;this.html5Test=/^(probably|maybe)$/i;this.preferFlash=
!0;this.noSWFCache=!1;this.audioFormats={mp3:{type:['audio/mpeg; codecs="mp3"',"audio/mpeg","audio/mp3","audio/MPA","audio/mpa-robust"],required:!0},mp4:{related:["aac","m4a"],type:['audio/mp4; codecs="mp4a.40.2"',"audio/aac","audio/x-m4a","audio/MP4A-LATM","audio/mpeg4-generic"],required:!1},ogg:{type:["audio/ogg; codecs=vorbis"],required:!1},wav:{type:['audio/wav; codecs="1"',"audio/wav","audio/wave","audio/x-wav"],required:!1}};this.defaultOptions={autoLoad:!1,autoPlay:!1,from:null,loops:1,onid3:null,
onload:null,whileloading:null,onplay:null,onpause:null,onresume:null,whileplaying:null,onposition:null,onstop:null,onfailure:null,onfinish:null,multiShot:!0,multiShotEvents:!1,position:null,pan:0,stream:!0,to:null,type:null,usePolicyFile:!1,volume:100};this.flash9Options={isMovieStar:null,usePeakData:!1,useWaveformData:!1,useEQData:!1,onbufferchange:null,ondataerror:null};this.movieStarOptions={bufferTime:3,serverURL:null,onconnect:null,duration:null};this.movieID="sm2-container";this.id=ca||"sm2movie";
this.debugID="soundmanager-debug";this.debugURLParam=/([#?&])debug=1/i;this.versionNumber="V2.97a.20120318";this.movieURL=this.version=null;this.url=P||null;this.altURL=null;this.enabled=this.swfLoaded=!1;this.oMC=null;this.sounds={};this.soundIDs=[];this.didFlashBlock=this.muted=!1;this.filePattern=null;this.filePatterns={flash8:/\.mp3(\?.*)?$/i,flash9:/\.mp3(\?.*)?$/i};this.features={buffering:!1,peakData:!1,waveformData:!1,eqData:!1,movieStar:!1};this.sandbox={};var da;try{da="undefined"!==typeof Audio&&
"undefined"!==typeof(new Audio).canPlayType}catch(Wa){da=!1}this.hasHTML5=da;this.html5={usingFlash:null};this.flash={};this.ignoreFlash=this.html5Only=!1;var ya,c=this,h=null,Q,n=navigator.userAgent,g=H,ea=g.location.href.toString(),k=document,fa,R,j,q=[],I=!1,J=!1,o=!1,v=!1,ga=!1,K,s,ha,A,B,S,za,ia,y,T,C,ja,ka,la,U,D,Aa,ma,Ba,V,Ca,L=null,na=null,E,oa,F,W,X,pa,p,Y=!1,qa=!1,Da,Ea,Fa,Z=0,M=null,$,t=null,Ga,aa,N,w,ra,sa,Ha,m,Qa=Array.prototype.slice,z=!1,r,ba,Ia,u,Ja,ta=n.match(/(ipad|iphone|ipod)/i),
Ra=n.match(/firefox/i),Sa=n.match(/droid/i),x=n.match(/msie/i),Ta=n.match(/webkit/i),O=n.match(/safari/i)&&!n.match(/chrome/i),Ua=n.match(/opera/i),ua=n.match(/(mobile|pre\/|xoom)/i)||ta,va=!ea.match(/usehtml5audio/i)&&!ea.match(/sm2\-ignorebadua/i)&&O&&!n.match(/silk/i)&&n.match(/OS X 10_6_([3-7])/i),wa="undefined"!==typeof k.hasFocus?k.hasFocus():null,G=O&&"undefined"===typeof k.hasFocus,Ka=!G,La=/(mp3|mp4|mpa)/i,xa=k.location?k.location.protocol.match(/http/i):null,Ma=!xa?"http://":"",Na=/^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|mp4v|3gp|3g2)\s*(?:$|;)/i,
Oa="mpeg4,aac,flv,mov,mp4,m4v,f4v,m4a,mp4v,3gp,3g2".split(","),Va=RegExp("\\.("+Oa.join("|")+")(\\?.*)?$","i");this.mimePattern=/^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i;this.useAltURL=!xa;this._global_a=null;if(ua&&(c.useHTML5Audio=!0,c.preferFlash=!1,ta))z=c.ignoreFlash=!0;this.supported=this.ok=function(){return t?o&&!v:c.useHTML5Audio&&c.hasHTML5};this.getMovie=function(a){return Q(a)||k[a]||g[a]};this.createSound=function(a){function d(){e=W(e);c.sounds[f.id]=new ya(f);c.soundIDs.push(f.id);
return c.sounds[f.id]}var e=null,b=null,f=null;if(!o||!c.ok())return pa(void 0),!1;2===arguments.length&&(a={id:arguments[0],url:arguments[1]});e=s(a);e.url=$(e.url);f=e;if(p(f.id,!0))return c.sounds[f.id];if(aa(f))b=d(),b._setup_html5(f);else{if(8<j){if(null===f.isMovieStar)f.isMovieStar=f.serverURL||(f.type?f.type.match(Na):!1)||f.url.match(Va);if(f.isMovieStar&&f.usePeakData)f.usePeakData=!1}f=X(f,void 0);b=d();if(8===j)h._createSound(f.id,f.loops||1,f.usePolicyFile);else if(h._createSound(f.id,
f.url,f.usePeakData,f.useWaveformData,f.useEQData,f.isMovieStar,f.isMovieStar?f.bufferTime:!1,f.loops||1,f.serverURL,f.duration||null,f.autoPlay,!0,f.autoLoad,f.usePolicyFile),!f.serverURL)b.connected=!0,f.onconnect&&f.onconnect.apply(b);!f.serverURL&&(f.autoLoad||f.autoPlay)&&b.load(f)}!f.serverURL&&f.autoPlay&&b.play();return b};this.destroySound=function(a,d){if(!p(a))return!1;var e=c.sounds[a],b;e._iO={};e.stop();e.unload();for(b=0;b<c.soundIDs.length;b++)if(c.soundIDs[b]===a){c.soundIDs.splice(b,
1);break}d||e.destruct(!0);delete c.sounds[a];return!0};this.load=function(a,d){return!p(a)?!1:c.sounds[a].load(d)};this.unload=function(a){return!p(a)?!1:c.sounds[a].unload()};this.onposition=this.onPosition=function(a,d,e,b){return!p(a)?!1:c.sounds[a].onposition(d,e,b)};this.clearOnPosition=function(a,d,e){return!p(a)?!1:c.sounds[a].clearOnPosition(d,e)};this.start=this.play=function(a,d){if(!o||!c.ok())return pa("soundManager.play(): "+E(!o?"notReady":"notOK")),!1;if(!p(a)){d instanceof Object||
(d={url:d});return d&&d.url?(d.id=a,c.createSound(d).play()):!1}return c.sounds[a].play(d)};this.setPosition=function(a,d){return!p(a)?!1:c.sounds[a].setPosition(d)};this.stop=function(a){return!p(a)?!1:c.sounds[a].stop()};this.stopAll=function(){for(var a in c.sounds)c.sounds.hasOwnProperty(a)&&c.sounds[a].stop()};this.pause=function(a){return!p(a)?!1:c.sounds[a].pause()};this.pauseAll=function(){var a;for(a=c.soundIDs.length-1;0<=a;a--)c.sounds[c.soundIDs[a]].pause()};this.resume=function(a){return!p(a)?
!1:c.sounds[a].resume()};this.resumeAll=function(){var a;for(a=c.soundIDs.length-1;0<=a;a--)c.sounds[c.soundIDs[a]].resume()};this.togglePause=function(a){return!p(a)?!1:c.sounds[a].togglePause()};this.setPan=function(a,d){return!p(a)?!1:c.sounds[a].setPan(d)};this.setVolume=function(a,d){return!p(a)?!1:c.sounds[a].setVolume(d)};this.mute=function(a){var d=0;"string"!==typeof a&&(a=null);if(a)return!p(a)?!1:c.sounds[a].mute();for(d=c.soundIDs.length-1;0<=d;d--)c.sounds[c.soundIDs[d]].mute();return c.muted=
!0};this.muteAll=function(){c.mute()};this.unmute=function(a){"string"!==typeof a&&(a=null);if(a)return!p(a)?!1:c.sounds[a].unmute();for(a=c.soundIDs.length-1;0<=a;a--)c.sounds[c.soundIDs[a]].unmute();c.muted=!1;return!0};this.unmuteAll=function(){c.unmute()};this.toggleMute=function(a){return!p(a)?!1:c.sounds[a].toggleMute()};this.getMemoryUse=function(){var a=0;h&&8!==j&&(a=parseInt(h._getMemoryUse(),10));return a};this.disable=function(a){var d;"undefined"===typeof a&&(a=!1);if(v)return!1;v=!0;
for(d=c.soundIDs.length-1;0<=d;d--)Ba(c.sounds[c.soundIDs[d]]);K(a);m.remove(g,"load",B);return!0};this.canPlayMIME=function(a){var d;c.hasHTML5&&(d=N({type:a}));return!t||d?d:a&&c.ok()?!!(8<j&&a.match(Na)||a.match(c.mimePattern)):null};this.canPlayURL=function(a){var d;c.hasHTML5&&(d=N({url:a}));return!t||d?d:a&&c.ok()?!!a.match(c.filePattern):null};this.canPlayLink=function(a){return"undefined"!==typeof a.type&&a.type&&c.canPlayMIME(a.type)?!0:c.canPlayURL(a.href)};this.getSoundById=function(a){if(!a)throw Error("soundManager.getSoundById(): sID is null/undefined");
return c.sounds[a]};this.onready=function(a,c){if(a&&a instanceof Function)return c||(c=g),ha("onready",a,c),A(),!0;throw E("needFunction","onready");};this.ontimeout=function(a,c){if(a&&a instanceof Function)return c||(c=g),ha("ontimeout",a,c),A({type:"ontimeout"}),!0;throw E("needFunction","ontimeout");};this._wD=this._writeDebug=function(){return!0};this._debug=function(){};this.reboot=function(){var a,d;for(a=c.soundIDs.length-1;0<=a;a--)c.sounds[c.soundIDs[a]].destruct();try{if(x)na=h.innerHTML;
L=h.parentNode.removeChild(h)}catch(e){}na=L=t=null;c.enabled=ka=o=Y=qa=I=J=v=c.swfLoaded=!1;c.soundIDs=[];c.sounds={};h=null;for(a in q)if(q.hasOwnProperty(a))for(d=q[a].length-1;0<=d;d--)q[a][d].fired=!1;g.setTimeout(c.beginDelayedInit,20)};this.getMoviePercent=function(){return h&&"undefined"!==typeof h.PercentLoaded?h.PercentLoaded():null};this.beginDelayedInit=function(){ga=!0;C();setTimeout(function(){if(qa)return!1;U();T();return qa=!0},20);S()};this.destruct=function(){c.disable(!0)};ya=function(a){var d,
e,b=this,f,i,Pa,g,k,m,l=!1,n=[],o=0,r,t,q=null;d=null;e=null;this.sID=a.id;this.url=a.url;this._iO=this.instanceOptions=this.options=s(a);this.pan=this.options.pan;this.volume=this.options.volume;this.isHTML5=!1;this._a=null;this.id3={};this._debug=function(){};this.load=function(a){var c=null;if("undefined"!==typeof a)b._iO=s(a,b.options),b.instanceOptions=b._iO;else if(a=b.options,b._iO=a,b.instanceOptions=b._iO,q&&q!==b.url)b._iO.url=b.url,b.url=null;if(!b._iO.url)b._iO.url=b.url;b._iO.url=$(b._iO.url);
if(b._iO.url===b.url&&0!==b.readyState&&2!==b.readyState)return 3===b.readyState&&b._iO.onload&&b._iO.onload.apply(b,[!!b.duration]),b;a=b._iO;q=b.url;b.loaded=!1;b.readyState=1;b.playState=0;if(aa(a)){if(c=b._setup_html5(a),!c._called_load)b._html5_canplay=!1,b._a.autobuffer="auto",b._a.preload="auto",c.load(),c._called_load=!0,a.autoPlay&&b.play()}else try{b.isHTML5=!1,b._iO=X(W(a)),a=b._iO,8===j?h._load(b.sID,a.url,a.stream,a.autoPlay,a.whileloading?1:0,a.loops||1,a.usePolicyFile):h._load(b.sID,
a.url,!!a.stream,!!a.autoPlay,a.loops||1,!!a.autoLoad,a.usePolicyFile)}catch(d){D({type:"SMSOUND_LOAD_JS_EXCEPTION",fatal:!0})}return b};this.unload=function(){0!==b.readyState&&(b.isHTML5?(g(),b._a&&(b._a.pause(),ra(b._a))):8===j?h._unload(b.sID,"about:blank"):h._unload(b.sID),f());return b};this.destruct=function(a){if(b.isHTML5){if(g(),b._a)b._a.pause(),ra(b._a),z||Pa(),b._a._t=null,b._a=null}else b._iO.onfailure=null,h._destroySound(b.sID);a||c.destroySound(b.sID,!0)};this.start=this.play=function(a,
c){var d,c=void 0===c?!0:c;a||(a={});b._iO=s(a,b._iO);b._iO=s(b._iO,b.options);b._iO.url=$(b._iO.url);b.instanceOptions=b._iO;if(b._iO.serverURL&&!b.connected)return b.getAutoPlay()||b.setAutoPlay(!0),b;aa(b._iO)&&(b._setup_html5(b._iO),k());if(1===b.playState&&!b.paused&&(d=b._iO.multiShot,!d))return b;if(!b.loaded)if(0===b.readyState){if(!b.isHTML5)b._iO.autoPlay=!0;b.load(b._iO)}else if(2===b.readyState)return b;if(!b.isHTML5&&9===j&&0<b.position&&b.position===b.duration)a.position=0;if(b.paused&&
b.position&&0<b.position)b.resume();else{b._iO=s(a,b._iO);if(null!==b._iO.from&&null!==b._iO.to&&0===b.instanceCount&&0===b.playState&&!b._iO.serverURL){d=function(){b._iO=s(a,b._iO);b.play(b._iO)};if(b.isHTML5&&!b._html5_canplay)return b.load({_oncanplay:d}),!1;if(!b.isHTML5&&!b.loaded&&(!b.readyState||2!==b.readyState))return b.load({onload:d}),!1;b._iO=t()}(!b.instanceCount||b._iO.multiShotEvents||!b.isHTML5&&8<j&&!b.getAutoPlay())&&b.instanceCount++;0===b.playState&&b._iO.onposition&&m(b);b.playState=
1;b.paused=!1;b.position="undefined"!==typeof b._iO.position&&!isNaN(b._iO.position)?b._iO.position:0;if(!b.isHTML5)b._iO=X(W(b._iO));b._iO.onplay&&c&&(b._iO.onplay.apply(b),l=!0);b.setVolume(b._iO.volume,!0);b.setPan(b._iO.pan,!0);b.isHTML5?(k(),d=b._setup_html5(),b.setPosition(b._iO.position),d.play()):h._start(b.sID,b._iO.loops||1,9===j?b._iO.position:b._iO.position/1E3)}return b};this.stop=function(a){var c=b._iO;if(1===b.playState){b._onbufferchange(0);b._resetOnPosition(0);b.paused=!1;if(!b.isHTML5)b.playState=
0;r();c.to&&b.clearOnPosition(c.to);if(b.isHTML5){if(b._a)a=b.position,b.setPosition(0),b.position=a,b._a.pause(),b.playState=0,b._onTimer(),g()}else h._stop(b.sID,a),c.serverURL&&b.unload();b.instanceCount=0;b._iO={};c.onstop&&c.onstop.apply(b)}return b};this.setAutoPlay=function(a){b._iO.autoPlay=a;b.isHTML5||(h._setAutoPlay(b.sID,a),a&&!b.instanceCount&&1===b.readyState&&b.instanceCount++)};this.getAutoPlay=function(){return b._iO.autoPlay};this.setPosition=function(a){void 0===a&&(a=0);var c=
b.isHTML5?Math.max(a,0):Math.min(b.duration||b._iO.duration,Math.max(a,0));b.position=c;a=b.position/1E3;b._resetOnPosition(b.position);b._iO.position=c;if(b.isHTML5){if(b._a&&b._html5_canplay&&b._a.currentTime!==a)try{b._a.currentTime=a,(0===b.playState||b.paused)&&b._a.pause()}catch(d){}}else a=9===j?b.position:a,b.readyState&&2!==b.readyState&&h._setPosition(b.sID,a,b.paused||!b.playState);b.isHTML5&&b.paused&&b._onTimer(!0);return b};this.pause=function(a){if(b.paused||0===b.playState&&1!==b.readyState)return b;
b.paused=!0;b.isHTML5?(b._setup_html5().pause(),g()):(a||void 0===a)&&h._pause(b.sID);b._iO.onpause&&b._iO.onpause.apply(b);return b};this.resume=function(){var a=b._iO;if(!b.paused)return b;b.paused=!1;b.playState=1;b.isHTML5?(b._setup_html5().play(),k()):(a.isMovieStar&&!a.serverURL&&b.setPosition(b.position),h._pause(b.sID));!l&&a.onplay?(a.onplay.apply(b),l=!0):a.onresume&&a.onresume.apply(b);return b};this.togglePause=function(){if(0===b.playState)return b.play({position:9===j&&!b.isHTML5?b.position:
b.position/1E3}),b;b.paused?b.resume():b.pause();return b};this.setPan=function(a,c){"undefined"===typeof a&&(a=0);"undefined"===typeof c&&(c=!1);b.isHTML5||h._setPan(b.sID,a);b._iO.pan=a;if(!c)b.pan=a,b.options.pan=a;return b};this.setVolume=function(a,d){"undefined"===typeof a&&(a=100);"undefined"===typeof d&&(d=!1);if(b.isHTML5){if(b._a)b._a.volume=Math.max(0,Math.min(1,a/100))}else h._setVolume(b.sID,c.muted&&!b.muted||b.muted?0:a);b._iO.volume=a;if(!d)b.volume=a,b.options.volume=a;return b};
this.mute=function(){b.muted=!0;if(b.isHTML5){if(b._a)b._a.muted=!0}else h._setVolume(b.sID,0);return b};this.unmute=function(){b.muted=!1;var a="undefined"!==typeof b._iO.volume;if(b.isHTML5){if(b._a)b._a.muted=!1}else h._setVolume(b.sID,a?b._iO.volume:b.options.volume);return b};this.toggleMute=function(){return b.muted?b.unmute():b.mute()};this.onposition=this.onPosition=function(a,c,d){n.push({position:parseInt(a,10),method:c,scope:"undefined"!==typeof d?d:b,fired:!1});return b};this.clearOnPosition=
function(b,a){var c,b=parseInt(b,10);if(isNaN(b))return!1;for(c=0;c<n.length;c++)if(b===n[c].position&&(!a||a===n[c].method))n[c].fired&&o--,n.splice(c,1)};this._processOnPosition=function(){var a,c;a=n.length;if(!a||!b.playState||o>=a)return!1;for(a-=1;0<=a;a--)if(c=n[a],!c.fired&&b.position>=c.position)c.fired=!0,o++,c.method.apply(c.scope,[c.position]);return!0};this._resetOnPosition=function(b){var a,c;a=n.length;if(!a)return!1;for(a-=1;0<=a;a--)if(c=n[a],c.fired&&b<=c.position)c.fired=!1,o--;
return!0};t=function(){var a=b._iO,c=a.from,d=a.to,f,e;e=function(){b.clearOnPosition(d,e);b.stop()};f=function(){if(null!==d&&!isNaN(d))b.onPosition(d,e)};if(null!==c&&!isNaN(c))a.position=c,a.multiShot=!1,f();return a};m=function(){var a,c=b._iO.onposition;if(c)for(a in c)if(c.hasOwnProperty(a))b.onPosition(parseInt(a,10),c[a])};r=function(){var a,c=b._iO.onposition;if(c)for(a in c)c.hasOwnProperty(a)&&b.clearOnPosition(parseInt(a,10))};k=function(){b.isHTML5&&Da(b)};g=function(){b.isHTML5&&Ea(b)};
f=function(){n=[];o=0;l=!1;b._hasTimer=null;b._a=null;b._html5_canplay=!1;b.bytesLoaded=null;b.bytesTotal=null;b.duration=b._iO&&b._iO.duration?b._iO.duration:null;b.durationEstimate=null;b.eqData=[];b.eqData.left=[];b.eqData.right=[];b.failures=0;b.isBuffering=!1;b.instanceOptions={};b.instanceCount=0;b.loaded=!1;b.metadata={};b.readyState=0;b.muted=!1;b.paused=!1;b.peakData={left:0,right:0};b.waveformData={left:[],right:[]};b.playState=0;b.position=null};f();this._onTimer=function(a){var c,f=!1,
i={};if(b._hasTimer||a){if(b._a&&(a||(0<b.playState||1===b.readyState)&&!b.paused)){c=b._get_html5_duration();if(c!==d)d=c,b.duration=c,f=!0;b.durationEstimate=b.duration;c=1E3*b._a.currentTime||0;c!==e&&(e=c,f=!0);(f||a)&&b._whileplaying(c,i,i,i,i);return f}return!1}};this._get_html5_duration=function(){var a=b._iO,c=b._a?1E3*b._a.duration:a?a.duration:void 0;return c&&!isNaN(c)&&Infinity!==c?c:a?a.duration:null};this._setup_html5=function(a){var a=s(b._iO,a),d=decodeURI,e=z?c._global_a:b._a,h=d(a.url),
g=e&&e._t?e._t.instanceOptions:null;if(e){if(e._t&&(!z&&h===d(q)||z&&g.url===a.url&&(!q||q===g.url)))return e;z&&e._t&&e._t.playState&&a.url!==g.url&&e._t.stop();f();e.src=a.url;q=b.url=a.url;e._called_load=!1}else{e=new Audio(a.url);e._called_load=!1;if(Sa)e._called_load=!0;if(z)c._global_a=e}b.isHTML5=!0;b._a=e;e._t=b;i();e.loop=1<a.loops?"loop":"";a.autoLoad||a.autoPlay?b.load():(e.autobuffer=!1,e.preload="none");e.loop=1<a.loops?"loop":"";return e};i=function(){if(b._a._added_events)return!1;
var a;b._a._added_events=!0;for(a in u)u.hasOwnProperty(a)&&b._a&&b._a.addEventListener(a,u[a],!1);return!0};Pa=function(){var a;b._a._added_events=!1;for(a in u)u.hasOwnProperty(a)&&b._a&&b._a.removeEventListener(a,u[a],!1)};this._onload=function(a){a=!!a;b.loaded=a;b.readyState=a?3:2;b._onbufferchange(0);b._iO.onload&&b._iO.onload.apply(b,[a]);return!0};this._onbufferchange=function(a){if(0===b.playState||a&&b.isBuffering||!a&&!b.isBuffering)return!1;b.isBuffering=1===a;b._iO.onbufferchange&&b._iO.onbufferchange.apply(b);
return!0};this._onsuspend=function(){b._iO.onsuspend&&b._iO.onsuspend.apply(b);return!0};this._onfailure=function(a,c,d){b.failures++;if(b._iO.onfailure&&1===b.failures)b._iO.onfailure(b,a,c,d)};this._onfinish=function(){var a=b._iO.onfinish;b._onbufferchange(0);b._resetOnPosition(0);if(b.instanceCount){b.instanceCount--;if(!b.instanceCount)r(),b.playState=0,b.paused=!1,b.instanceCount=0,b.instanceOptions={},b._iO={},g();(!b.instanceCount||b._iO.multiShotEvents)&&a&&a.apply(b)}};this._whileloading=
function(a,c,d,e){var f=b._iO;b.bytesLoaded=a;b.bytesTotal=c;b.duration=Math.floor(d);b.bufferLength=e;if(f.isMovieStar)b.durationEstimate=b.duration;else if(b.durationEstimate=f.duration?b.duration>f.duration?b.duration:f.duration:parseInt(b.bytesTotal/b.bytesLoaded*b.duration,10),void 0===b.durationEstimate)b.durationEstimate=b.duration;3!==b.readyState&&f.whileloading&&f.whileloading.apply(b)};this._whileplaying=function(a,c,d,e,f){var i=b._iO;if(isNaN(a)||null===a)return!1;b.position=a;b._processOnPosition();
if(!b.isHTML5&&8<j){if(i.usePeakData&&"undefined"!==typeof c&&c)b.peakData={left:c.leftPeak,right:c.rightPeak};if(i.useWaveformData&&"undefined"!==typeof d&&d)b.waveformData={left:d.split(","),right:e.split(",")};if(i.useEQData&&"undefined"!==typeof f&&f&&f.leftEQ&&(a=f.leftEQ.split(","),b.eqData=a,b.eqData.left=a,"undefined"!==typeof f.rightEQ&&f.rightEQ))b.eqData.right=f.rightEQ.split(",")}1===b.playState&&(!b.isHTML5&&8===j&&!b.position&&b.isBuffering&&b._onbufferchange(0),i.whileplaying&&i.whileplaying.apply(b));
return!0};this._onmetadata=function(a,c){var d={},f,e;for(f=0,e=a.length;f<e;f++)d[a[f]]=c[f];b.metadata=d;b._iO.onmetadata&&b._iO.onmetadata.apply(b)};this._onid3=function(a,c){var d=[],f,e;for(f=0,e=a.length;f<e;f++)d[a[f]]=c[f];b.id3=s(b.id3,d);b._iO.onid3&&b._iO.onid3.apply(b)};this._onconnect=function(a){a=1===a;if(b.connected=a)b.failures=0,p(b.sID)&&(b.getAutoPlay()?b.play(void 0,b.getAutoPlay()):b._iO.autoLoad&&b.load()),b._iO.onconnect&&b._iO.onconnect.apply(b,[a])};this._ondataerror=function(){0<
b.playState&&b._iO.ondataerror&&b._iO.ondataerror.apply(b)}};la=function(){return k.body||k._docElement||k.getElementsByTagName("div")[0]};Q=function(a){return k.getElementById(a)};s=function(a,d){var e={},b,f;for(b in a)a.hasOwnProperty(b)&&(e[b]=a[b]);b="undefined"===typeof d?c.defaultOptions:d;for(f in b)b.hasOwnProperty(f)&&"undefined"===typeof e[f]&&(e[f]=b[f]);return e};m=function(){function a(a){var a=Qa.call(a),b=a.length;e?(a[1]="on"+a[1],3<b&&a.pop()):3===b&&a.push(!1);return a}function c(a,
d){var g=a.shift(),h=[b[d]];if(e)g[h](a[0],a[1]);else g[h].apply(g,a)}var e=g.attachEvent,b={add:e?"attachEvent":"addEventListener",remove:e?"detachEvent":"removeEventListener"};return{add:function(){c(a(arguments),"add")},remove:function(){c(a(arguments),"remove")}}}();u={abort:l(function(){}),canplay:l(function(){var a=this._t,c;if(a._html5_canplay)return!0;a._html5_canplay=!0;a._onbufferchange(0);c=!isNaN(a.position)?a.position/1E3:null;if(a.position&&this.currentTime!==c)try{this.currentTime=
c}catch(e){}a._iO._oncanplay&&a._iO._oncanplay()}),load:l(function(){var a=this._t;a.loaded||(a._onbufferchange(0),a._whileloading(a.bytesTotal,a.bytesTotal,a._get_html5_duration()),a._onload(!0))}),ended:l(function(){this._t._onfinish()}),error:l(function(){this._t._onload(!1)}),loadeddata:l(function(){var a=this._t,c=a.bytesTotal||1;if(!a._loaded&&!O)a.duration=a._get_html5_duration(),a._whileloading(c,c,a._get_html5_duration()),a._onload(!0)}),loadedmetadata:l(function(){}),loadstart:l(function(){this._t._onbufferchange(1)}),
play:l(function(){this._t._onbufferchange(0)}),playing:l(function(){this._t._onbufferchange(0)}),progress:l(function(a){var c=this._t,e,b=0,f=a.target.buffered;e=a.loaded||0;var i=a.total||1;if(c.loaded)return!1;if(f&&f.length){for(e=f.length-1;0<=e;e--)b=f.end(e)-f.start(e);e=b/a.target.duration}isNaN(e)||(c._onbufferchange(0),c._whileloading(e,i,c._get_html5_duration()),e&&i&&e===i&&u.load.call(this,a))}),ratechange:l(function(){}),suspend:l(function(a){var c=this._t;u.progress.call(this,a);c._onsuspend()}),
stalled:l(function(){}),timeupdate:l(function(){this._t._onTimer()}),waiting:l(function(){this._t._onbufferchange(1)})};aa=function(a){return!a.serverURL&&(a.type?N({type:a.type}):N({url:a.url})||c.html5Only)};ra=function(a){if(a)a.src=Ra?"":"about:blank"};N=function(a){function d(a){return c.preferFlash&&r&&!c.ignoreFlash&&"undefined"!==typeof c.flash[a]&&c.flash[a]}if(!c.useHTML5Audio||!c.hasHTML5)return!1;var e=a.url||null,a=a.type||null,b=c.audioFormats,f;if(a&&"undefined"!==typeof c.html5[a])return c.html5[a]&&
!d(a);if(!w){w=[];for(f in b)b.hasOwnProperty(f)&&(w.push(f),b[f].related&&(w=w.concat(b[f].related)));w=RegExp("\\.("+w.join("|")+")(\\?.*)?$","i")}f=e?e.toLowerCase().match(w):null;if(!f||!f.length)if(a)e=a.indexOf(";"),f=(-1!==e?a.substr(0,e):a).substr(6);else return!1;else f=f[1];if(f&&"undefined"!==typeof c.html5[f])return c.html5[f]&&!d(f);a="audio/"+f;e=c.html5.canPlayType({type:a});return(c.html5[f]=e)&&c.html5[a]&&!d(a)};Ha=function(){function a(a){var b,e,f=!1;if(!d||"function"!==typeof d.canPlayType)return!1;
if(a instanceof Array){for(b=0,e=a.length;b<e&&!f;b++)if(c.html5[a[b]]||d.canPlayType(a[b]).match(c.html5Test))f=!0,c.html5[a[b]]=!0,c.flash[a[b]]=!(!c.preferFlash||!r||!a[b].match(La));return f}a=d&&"function"===typeof d.canPlayType?d.canPlayType(a):!1;return!(!a||!a.match(c.html5Test))}if(!c.useHTML5Audio||"undefined"===typeof Audio)return!1;var d="undefined"!==typeof Audio?Ua?new Audio(null):new Audio:null,e,b={},f,i;f=c.audioFormats;for(e in f)if(f.hasOwnProperty(e)&&(b[e]=a(f[e].type),b["audio/"+
e]=b[e],c.flash[e]=c.preferFlash&&!c.ignoreFlash&&e.match(La)?!0:!1,f[e]&&f[e].related))for(i=f[e].related.length-1;0<=i;i--)b["audio/"+f[e].related[i]]=b[e],c.html5[f[e].related[i]]=b[e],c.flash[f[e].related[i]]=b[e];b.canPlayType=d?a:null;c.html5=s(c.html5,b);return!0};E=function(){};W=function(a){if(8===j&&1<a.loops&&a.stream)a.stream=!1;return a};X=function(a){if(a&&!a.usePolicyFile&&(a.onid3||a.usePeakData||a.useWaveformData||a.useEQData))a.usePolicyFile=!0;return a};pa=function(){};fa=function(){return!1};
Ba=function(a){for(var c in a)a.hasOwnProperty(c)&&"function"===typeof a[c]&&(a[c]=fa)};V=function(a){"undefined"===typeof a&&(a=!1);(v||a)&&c.disable(a)};Ca=function(a){var d=null;if(a)if(a.match(/\.swf(\?.*)?$/i)){if(d=a.substr(a.toLowerCase().lastIndexOf(".swf?")+4))return a}else a.lastIndexOf("/")!==a.length-1&&(a+="/");a=(a&&-1!==a.lastIndexOf("/")?a.substr(0,a.lastIndexOf("/")+1):"./")+c.movieURL;c.noSWFCache&&(a+="?ts="+(new Date).getTime());return a};ia=function(){j=parseInt(c.flashVersion,
10);if(8!==j&&9!==j)c.flashVersion=j=8;var a=c.debugMode||c.debugFlash?"_debug.swf":".swf";if(c.useHTML5Audio&&!c.html5Only&&c.audioFormats.mp4.required&&9>j)c.flashVersion=j=9;c.version=c.versionNumber+(c.html5Only?" (HTML5-only mode)":9===j?" (AS3/Flash 9)":" (AS2/Flash 8)");8<j?(c.defaultOptions=s(c.defaultOptions,c.flash9Options),c.features.buffering=!0,c.defaultOptions=s(c.defaultOptions,c.movieStarOptions),c.filePatterns.flash9=RegExp("\\.(mp3|"+Oa.join("|")+")(\\?.*)?$","i"),c.features.movieStar=
!0):c.features.movieStar=!1;c.filePattern=c.filePatterns[8!==j?"flash9":"flash8"];c.movieURL=(8===j?"soundmanager2.swf":"soundmanager2_flash9.swf").replace(".swf",a);c.features.peakData=c.features.waveformData=c.features.eqData=8<j};Aa=function(a,c){if(!h)return!1;h._setPolling(a,c)};ma=function(){if(c.debugURLParam.test(ea))c.debugMode=!0};p=this.getSoundById;F=function(){var a=[];c.debugMode&&a.push("sm2_debug");c.debugFlash&&a.push("flash_debug");c.useHighPerformance&&a.push("high_performance");
return a.join(" ")};oa=function(){E("fbHandler");var a=c.getMoviePercent(),d={type:"FLASHBLOCK"};if(c.html5Only)return!1;if(c.ok()){if(c.oMC)c.oMC.className=[F(),"movieContainer","swf_loaded"+(c.didFlashBlock?" swf_unblocked":"")].join(" ")}else{if(t)c.oMC.className=F()+" movieContainer "+(null===a?"swf_timedout":"swf_error");c.didFlashBlock=!0;A({type:"ontimeout",ignoreInit:!0,error:d});D(d)}};ha=function(a,c,e){"undefined"===typeof q[a]&&(q[a]=[]);q[a].push({method:c,scope:e||null,fired:!1})};A=
function(a){a||(a={type:"onready"});if(!o&&a&&!a.ignoreInit||"ontimeout"===a.type&&c.ok())return!1;var d={success:a&&a.ignoreInit?c.ok():!v},e=a&&a.type?q[a.type]||[]:[],b=[],f,d=[d],i=t&&c.useFlashBlock&&!c.ok();if(a.error)d[0].error=a.error;for(a=0,f=e.length;a<f;a++)!0!==e[a].fired&&b.push(e[a]);if(b.length)for(a=0,f=b.length;a<f;a++)if(b[a].scope?b[a].method.apply(b[a].scope,d):b[a].method.apply(this,d),!i)b[a].fired=!0;return!0};B=function(){g.setTimeout(function(){c.useFlashBlock&&oa();A();
c.onload instanceof Function&&c.onload.apply(g);c.waitForWindowLoad&&m.add(g,"load",B)},1)};ba=function(){if(void 0!==r)return r;var a=!1,c=navigator,e=c.plugins,b,f=g.ActiveXObject;if(e&&e.length)(c=c.mimeTypes)&&c["application/x-shockwave-flash"]&&c["application/x-shockwave-flash"].enabledPlugin&&c["application/x-shockwave-flash"].enabledPlugin.description&&(a=!0);else if("undefined"!==typeof f){try{b=new f("ShockwaveFlash.ShockwaveFlash")}catch(i){}a=!!b}return r=a};Ga=function(){var a,d;if(ta&&
n.match(/os (1|2|3_0|3_1)/i)){c.hasHTML5=!1;c.html5Only=!0;if(c.oMC)c.oMC.style.display="none";return!1}if(c.useHTML5Audio){if(!c.html5||!c.html5.canPlayType)return c.hasHTML5=!1,!0;c.hasHTML5=!0;if(va&&ba())return!0}else return!0;for(d in c.audioFormats)if(c.audioFormats.hasOwnProperty(d)&&(c.audioFormats[d].required&&!c.html5.canPlayType(c.audioFormats[d].type)||c.flash[d]||c.flash[c.audioFormats[d].type]))a=!0;c.ignoreFlash&&(a=!1);c.html5Only=c.hasHTML5&&c.useHTML5Audio&&!a;return!c.html5Only};
$=function(a){var d,e,b=0;if(a instanceof Array){for(d=0,e=a.length;d<e;d++)if(a[d]instanceof Object){if(c.canPlayMIME(a[d].type)){b=d;break}}else if(c.canPlayURL(a[d])){b=d;break}if(a[b].url)a[b]=a[b].url;return a[b]}return a};Da=function(a){if(!a._hasTimer)a._hasTimer=!0,!ua&&c.html5PollingInterval&&(null===M&&0===Z&&(M=H.setInterval(Fa,c.html5PollingInterval)),Z++)};Ea=function(a){if(a._hasTimer)a._hasTimer=!1,!ua&&c.html5PollingInterval&&Z--};Fa=function(){var a;if(null!==M&&!Z)return H.clearInterval(M),
M=null,!1;for(a=c.soundIDs.length-1;0<=a;a--)c.sounds[c.soundIDs[a]].isHTML5&&c.sounds[c.soundIDs[a]]._hasTimer&&c.sounds[c.soundIDs[a]]._onTimer()};D=function(a){a="undefined"!==typeof a?a:{};c.onerror instanceof Function&&c.onerror.apply(g,[{type:"undefined"!==typeof a.type?a.type:null}]);"undefined"!==typeof a.fatal&&a.fatal&&c.disable()};Ia=function(){if(!va||!ba())return!1;var a=c.audioFormats,d,e;for(e in a)if(a.hasOwnProperty(e)&&("mp3"===e||"mp4"===e))if(c.html5[e]=!1,a[e]&&a[e].related)for(d=
a[e].related.length-1;0<=d;d--)c.html5[a[e].related[d]]=!1};this._setSandboxType=function(){};this._externalInterfaceOK=function(){if(c.swfLoaded)return!1;(new Date).getTime();c.swfLoaded=!0;G=!1;va&&Ia();x?setTimeout(R,100):R()};U=function(a,d){function e(a,b){return'<param name="'+a+'" value="'+b+'" />'}if(I&&J)return!1;if(c.html5Only)return ia(),c.oMC=Q(c.movieID),R(),J=I=!0,!1;var b=d||c.url,f=c.altURL||b,i;i=la();var g,h,j=F(),l,m=null,m=(m=k.getElementsByTagName("html")[0])&&m.dir&&m.dir.match(/rtl/i),
a="undefined"===typeof a?c.id:a;ia();c.url=Ca(xa?b:f);d=c.url;c.wmode=!c.wmode&&c.useHighPerformance?"transparent":c.wmode;if(null!==c.wmode&&(n.match(/msie 8/i)||!x&&!c.useHighPerformance)&&navigator.platform.match(/win32|win64/i))c.wmode=null;i={name:a,id:a,src:d,quality:"high",allowScriptAccess:c.allowScriptAccess,bgcolor:c.bgColor,pluginspage:Ma+"www.macromedia.com/go/getflashplayer",title:"JS/Flash audio component (SoundManager 2)",type:"application/x-shockwave-flash",wmode:c.wmode,hasPriority:"true"};
if(c.debugFlash)i.FlashVars="debug=1";c.wmode||delete i.wmode;if(x)b=k.createElement("div"),h=['<object id="'+a+'" data="'+d+'" type="'+i.type+'" title="'+i.title+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="'+Ma+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0" width="'+i.width+'" height="'+i.height+'">',e("movie",d),e("AllowScriptAccess",c.allowScriptAccess),e("quality",i.quality),c.wmode?e("wmode",c.wmode):"",e("bgcolor",c.bgColor),e("hasPriority",
"true"),c.debugFlash?e("FlashVars",i.FlashVars):"","</object>"].join("");else for(g in b=k.createElement("embed"),i)i.hasOwnProperty(g)&&b.setAttribute(g,i[g]);ma();j=F();if(i=la())if(c.oMC=Q(c.movieID)||k.createElement("div"),c.oMC.id){l=c.oMC.className;c.oMC.className=(l?l+" ":"movieContainer")+(j?" "+j:"");c.oMC.appendChild(b);if(x)g=c.oMC.appendChild(k.createElement("div")),g.className="sm2-object-box",g.innerHTML=h;J=!0}else{c.oMC.id=c.movieID;c.oMC.className="movieContainer "+j;g=j=null;if(!c.useFlashBlock)if(c.useHighPerformance)j=
{position:"fixed",width:"8px",height:"8px",bottom:"0px",left:"0px",overflow:"hidden"};else if(j={position:"absolute",width:"6px",height:"6px",top:"-9999px",left:"-9999px"},m)j.left=Math.abs(parseInt(j.left,10))+"px";if(Ta)c.oMC.style.zIndex=1E4;if(!c.debugFlash)for(l in j)j.hasOwnProperty(l)&&(c.oMC.style[l]=j[l]);try{x||c.oMC.appendChild(b);i.appendChild(c.oMC);if(x)g=c.oMC.appendChild(k.createElement("div")),g.className="sm2-object-box",g.innerHTML=h;J=!0}catch(o){throw Error(E("domError")+" \n"+
o.toString());}}return I=!0};T=function(){if(c.html5Only)return U(),!1;if(h)return!1;h=c.getMovie(c.id);if(!h)L?(x?c.oMC.innerHTML=na:c.oMC.appendChild(L),L=null,I=!0):U(c.id,c.url),h=c.getMovie(c.id);c.oninitmovie instanceof Function&&setTimeout(c.oninitmovie,1);return!0};S=function(){setTimeout(za,1E3)};za=function(){if(Y)return!1;Y=!0;m.remove(g,"load",S);if(G&&!wa)return!1;var a;o||(a=c.getMoviePercent());setTimeout(function(){a=c.getMoviePercent();!o&&Ka&&(null===a?c.useFlashBlock||0===c.flashLoadTimeout?
c.useFlashBlock&&oa():V(!0):0!==c.flashLoadTimeout&&V(!0))},c.flashLoadTimeout)};y=function(){function a(){m.remove(g,"focus",y);m.remove(g,"load",y)}if(wa||!G)return a(),!0;wa=Ka=!0;O&&G&&m.remove(g,"mousemove",y);Y=!1;a();return!0};Ja=function(){var a,d=[];if(c.useHTML5Audio&&c.hasHTML5)for(a in c.audioFormats)c.audioFormats.hasOwnProperty(a)&&d.push(a+": "+c.html5[a]+(!c.html5[a]&&r&&c.flash[a]?" (using flash)":c.preferFlash&&c.flash[a]&&r?" (preferring flash)":!c.html5[a]?" ("+(c.audioFormats[a].required?
"required, ":"")+"and no flash support)":""))};K=function(a){if(o)return!1;if(c.html5Only)return o=!0,B(),!0;var d;if(!c.useFlashBlock||!c.flashLoadTimeout||c.getMoviePercent())o=!0,v&&(d={type:!r&&t?"NO_FLASH":"INIT_TIMEOUT"});if(v||a){if(c.useFlashBlock&&c.oMC)c.oMC.className=F()+" "+(null===c.getMoviePercent()?"swf_timedout":"swf_error");A({type:"ontimeout",error:d});D(d);return!1}if(c.waitForWindowLoad&&!ga)return m.add(g,"load",B),!1;B();return!0};R=function(){if(o)return!1;if(c.html5Only){if(!o)m.remove(g,
"load",c.beginDelayedInit),c.enabled=!0,K();return!0}T();try{h._externalInterfaceTest(!1),Aa(!0,c.flashPollingInterval||(c.useHighPerformance?10:50)),c.debugMode||h._disableDebug(),c.enabled=!0,c.html5Only||m.add(g,"unload",fa)}catch(a){return D({type:"JS_TO_FLASH_EXCEPTION",fatal:!0}),V(!0),K(),!1}K();m.remove(g,"load",c.beginDelayedInit);return!0};C=function(){if(ka)return!1;ka=!0;ma();if(!r&&c.hasHTML5)c.useHTML5Audio=!0,c.preferFlash=!1;Ha();c.html5.usingFlash=Ga();t=c.html5.usingFlash;Ja();if(!r&&
t)c.flashLoadTimeout=1;k.removeEventListener&&k.removeEventListener("DOMContentLoaded",C,!1);T();return!0};sa=function(){"complete"===k.readyState&&(C(),k.detachEvent("onreadystatechange",sa));return!0};ja=function(){ga=!0;m.remove(g,"load",ja)};ba();m.add(g,"focus",y);m.add(g,"load",y);m.add(g,"load",S);m.add(g,"load",ja);O&&G&&m.add(g,"mousemove",y);k.addEventListener?k.addEventListener("DOMContentLoaded",C,!1):k.attachEvent?k.attachEvent("onreadystatechange",sa):D({type:"NO_DOM2_EVENTS",fatal:!0});
"complete"===k.readyState&&setTimeout(C,100)}var ca=null;if("undefined"===typeof SM2_DEFER||!SM2_DEFER)ca=new P;H.SoundManager=P;H.soundManager=ca})(window);
var $container, GG, gg,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  _this = this;

(function() {
  var id, lastTime, vendor, vendors, _i, _len;
  vendors = ["ms", "moz", "webkit", "o"];
  for (_i = 0, _len = vendors.length; _i < _len; _i++) {
    vendor = vendors[_i];
    window.requestAnimationFrame = window[vendor + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[vendor + "CancelAnimationFrame"] || window[vendor + "CancelRequestAnimationFrame"];
    if (window.requestAnimationFrame) return;
  }
  if (!window.requestAnimationFrame) {
    lastTime = 0;
    id = null;
    window.requestAnimationFrame = function(callback, element) {
      var currTime, timeToCall;
      currTime = new Date().getTime();
      timeToCall = Math.max(0, 16 - (currTime - lastTime));
      id = window.setTimeout(function() {
        return callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();

soundManager.url = '/assets/swf/';

soundManager.flashVersion = 9;

soundManager.useFlashBlock = false;

GG = (function() {

  function GG(options) {
    var _this = this;
    this.options = options;
    this.loadsnds = __bind(this.loadsnds, this);
    this._frame = __bind(this._frame, this);
    this.entities = {};
    this.entities_uuid = 0;
    this.tags = {};
    this.keys = {};
    this.snds = {};
    $(window).on({
      keydown: function(evt) {
        _this.keys[evt.which] = 'd';
      },
      keyup: function(evt) {
        delete _this.keys[evt.which];
      },
      blur: function(evt) {
        _this.keys = {};
      }
    });
  }

  GG.prototype.add = function(item) {
    var tag, uuid, _i, _len, _ref;
    this.entities_uuid += 1;
    uuid = this.entities_uuid.toString(36);
    if (item.tags) {
      _ref = item.tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        if (!this.tags[tag]) this.tags[tag] = {};
        this.tags[tag][uuid] = 1;
      }
    }
    item.uuid = uuid;
    this.entities[uuid] = item;
    return this.entities_uuid;
  };

  GG.prototype.get = function(uuid) {
    return this.entities[uuid];
  };

  GG.prototype.each = function(tag, cb) {
    var id, _results, _results2;
    if (cb) {
      _results = [];
      for (id in this.tags[tag]) {
        _results.push(cb(this.entities[id]));
      }
      return _results;
    } else {
      cb = tag;
      _results2 = [];
      for (id in this.entities) {
        _results2.push(cb(this.entities[id]));
      }
      return _results2;
    }
  };

  GG.prototype.count = function(tag) {
    var id, s;
    s = 0;
    if (tag) {
      for (id in this.tags[tag]) {
        s += 1;
      }
    } else {
      for (id in this.entities) {
        s += 1;
      }
    }
    return s;
  };

  GG.prototype.find = function(tag) {
    var id, _results;
    _results = [];
    for (id in this.tags[tag]) {
      _results.push(this.entities[id]);
    }
    return _results;
  };

  GG.prototype.remove = function(bullet) {
    var tag, uuid, _i, _len, _ref;
    uuid = bullet.uuid;
    if (this.entities[uuid]) {
      if (this.entities[uuid].tags) {
        _ref = this.entities[uuid].tags;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tag = _ref[_i];
          delete this.tags[tag][uuid];
        }
      }
      return delete this.entities[uuid];
    }
  };

  GG.prototype.start = function() {
    this.prevFrame = new Date().getTime();
    return this._frame();
  };

  GG.prototype.frame = function(diff, total) {};

  GG.prototype._frame = function(total) {
    var diff;
    diff = total - this.prevFrame;
    this.frame(diff, total);
    return requestAnimationFrame(this._frame);
  };

  GG.prototype.loadsnds = function(loadthese) {
    var _this = this;
    soundManager.onready(function() {
      var soundId, url;
      for (soundId in loadthese) {
        url = loadthese[soundId];
        _this.snds[soundId] = soundManager.createSound({
          id: soundId,
          url: url
        });
      }
    });
  };

  return GG;

})();

gg = new GG();

gg.loadsnds({
  test: '../assets/sounds/test.mp3'
});

$container = $("#container")[0];

gg.frame = function(diff, total) {
  if (Math.random() > 0.1) {
    gg.add({
      vx: 0,
      vy: 0,
      x: 400,
      y: 300,
      tags: ['bullet']
    });
  }
  gg.each('bullet', function(bullet) {
    bullet.vx *= 0.99;
    bullet.vy *= 0.99;
    bullet.vy += (Math.random() - 0.5) * 1;
    bullet.vx += (Math.random() - 0.5) * 1;
    if (0 > bullet.y || bullet.y > 600 || 0 > bullet.x || bullet.x > 800) {
      bullet.ele.parentNode.removeChild(bullet.ele);
      gg.remove(bullet);
      if (gg.snds.test) {
        return gg.snds.test.play({
          volume: 10,
          pan: bullet.x * 100 / 800
        });
      }
    }
  });
  return gg.each(function(item) {
    item.x += item.vx;
    item.y += item.vy;
    if (!item.ele) {
      item.ele = document.createElement('div');
      item.ele.className = "block";
      $container.appendChild(item.ele);
    }
    return item.ele.style.cssText = ['top:', item.y, 'px;', 'left:', item.x, 'px;'].join('');
  });
};

gg.start();
