if (!String.prototype.includes) {
        String.prototype.includes = function() {
            'use strict';
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }
angular.module('app.Utility', [])
.service('Utility', function($q) {


    this.getQueryParam = function(p) {
        var escape = window["escape"]
          , unescape = window["unescape"];
        p = escape(unescape(p));
        var regex = new RegExp("[?&]" + p + "(?:=([^&]*))?","i");
        var match = regex.exec(window.location.search);
        return match != null  ? match[1] : null ;
    }
    ;
    /**
        * Ensure site url is or ends with '/'
        * @param url: string
        * @return string
        */
    this.formatSubsiteUrl = function(url) {
        return !!!url ? '/' : !/\/$/.test(url) ? url + '/' : url;
    }
    ;
    /**
        * Convert a name to REST camel case format
        * @param str: string
        * @return string
        */
    this.toCamelCase = function(str) {
        return str.toString()
        .replace(/\s*\b\w/g, function(x) {
            return (x[1] || x[0]).toUpperCase();
        }).replace(/\s/g, '')
        .replace(/\'s/, 'S')
        .replace(/[^A-Za-z0-9\s]/g, '');
    }
    ;
    /**
        * Parse a form ID from window.location.hash
        * @return number
        */
    this.getIdFromHash = function() {
        // example: parse ID from a URI `http://<mysite>/Forms/form.aspx/#/id/1`
        var rxHash = /\/id\/\d+/i;
        var exec = rxHash.exec(window.location.hash);
        var id = !!exec ? exec[0].replace(/\D/g, '') : null ;
        return /\d/.test(id) ? parseInt(id) : null ;
    }
    ;
    /**
        * Set location.hash to form ID `#/id/<ID>`.
        * @return void
        */
    this.setIdHash = function(id) {
        window.location.hash = '#/id/' + id;
    }
    ;
    /**
        * Escape column values
        * http://dracoblue.net/dev/encodedecode-special-xml-characters-in-javascript/155/
        */
    this.escapeColumnValue = function(s) {
        if (typeof s === "string") {
            return s.replace(/&(?![a-zA-Z]{1,8};)/g, "&amp;");
        }
        else {
            return s;
        }
    }
    ;


    this.parseDate = function(val) {
        if (!!!val) {
            return null ;
        }
        if (typeof val == 'object' && val.constructor == Date) {
            return val;
        }
        var rxSlash = /\d{1,2}\/\d{1,2}\/\d{2,4}/, // "09/29/2015"
        rxHyphen = /\d{1,2}-\d{1,2}-\d{2,4}/, // "09-29-2015"
        rxIsoDate = /\d{4}-\d{1,2}-\d{1,2}/, // "2015-09-29"
        rxTicks = /(\/|)\d{13}(\/|)/, // "/1442769001000/"
        rxIsoDateTime = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/, tmp, m, d, y, date = null ;
        val = rxIsoDate.test(val) ? val : (val + '').replace(/[^0-9\/\-]/g, '');
        if (val == '') {
            return null ;
        }
        if (rxSlash.test(val) || rxHyphen.test(val)) {
            tmp = rxSlash.test(val) ? val.split('/') : val.split('-');
            m = parseInt(tmp[0]) - 1;
            d = parseInt(tmp[1]);
            y = parseInt(tmp[2]);
            y = y < 100 ? 2000 + y : y;
            date = new Date(y,m,d,0,0,0,0);
        }
        else if (rxIsoDate.test(val)) {
            tmp = val.split('-');
            y = parseInt(tmp[0]);
            m = parseInt(tmp[1]) - 1;
            d = parseInt(tmp[2]);
            y = y < 100 ? 2000 + y : y;
            date = new Date(y,m,d,0,0,0,0);
        }
        else if (rxIsoDateTime.test(val)) {
            date = new Date(val);
        }
        else if (rxTicks.test(val)) {
            date = new Date(parseInt(val.replace(/\D/g, '')));
        }
        return date;
    }

    /**
            * Ensure site url is or ends with '/'
            * @param url: string
            * @return string
            */
    this.formatSubsiteUrl = function(url) {
        return !!!url ? '/' : !/\/$/.test(url) ? url + '/' : url;
    }

    /**
            * Convert a name to REST camel case format
            * @param str: string
            * @return string
            */
    this.toCamelCase = function(str) {
        return str.toString()
        .replace(/\s*\b\w/g, function(x) {
            return (x[1] || x[0]).toUpperCase();
        }).replace(/\s/g, '')
        .replace(/\'s/, 'S')
        .replace(/[^A-Za-z0-9\s]/g, '');
    }


    this.escapeColumnValue = function(value) {
        if (typeof value === "string") {
            return value.replace(/&(?![a-zA-Z]{1,8};)/g, "&amp;");
        } else {
            return value;
        }
    }



    this.isZrow = function(node) {
        return node.nodeName.toLowerCase() == 'z:row';
    }
});
