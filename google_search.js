var express = require("express");
var app = express();
var http = require('http');
var https = require('https');
var server = http.Server(app);
var fs = require("fs");
var bodyParser = require("body-parser");
var path = require('path');
var url = require('url');


//https://www.googleapis.com/customsearch/v1element?key=AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY&num=10&hl=he&start=20&cx=017135603890338635452:l5ri3atpm-y&q=iphone
function getPageFromGoogle(searchtext, start, cb) {

    var key = 'AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY';
    var cx = '017135603890338635452:l5ri3atpm-y';
    var num = 10;
    //   var fullPath = '/customsearch/v1element?key=' + key + '&num=' + num + '&hl=en&start=' + start + '&cx=' + cx + '&q=' + searchtext;

    var urlFormatted = url.format({
        pathname: '/customsearch/v1element',
        query: {
            key: key,
            cx: cx,
            start: start,
            num: num,
            q: searchtext
        }
    });

    var options = {
        hostname: 'www.googleapis.com',
        port: 443,
        path: urlFormatted,
        method: 'GET',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36'
        }
    };

    var data = '';

    var req = https.request(options, function(res) {

        res.on('data', function(d) {
            data += d;
        });

        res.on('end', function() {


            var koko = JSON.parse(data);
            var listURLS = [];

           //
           //  console.log('https://www.googleapis.com' + urlFormatted);
            //console.log(koko);

            if (koko.results) {
                koko.results.forEach(function(item) {
                    listURLS.push(item.url);
                });
            }

            return cb(listURLS);
        });
        req.on('error', function(e) {

            console.error(e);
        });

    });

    req.end();

    req.on('error', function(e) {
        console.error(e);
    });
}

exports.getResultsFromGoogle = function(searchtext, numOfPages, cb) {
    var count = 0;
    var arr = [];
    var MAX_REQUESTS = 10;

    for (var i = 0; i < numOfPages & i < MAX_REQUESTS; i++) {
        getPageFromGoogle(searchtext, i * 10, function(data) {
            count++;

            if (data.length > 0) {
                data.forEach(function(item) {
                    arr.push(item);
                });
            }

            if (count == numOfPages ||
                count == MAX_REQUESTS) {
                cb(arr);
            }
        });
    }
}
