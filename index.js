var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var http = require('http');
var https = require('https');
var server = http.Server(app);
var fs = require('fs');
var path = require('path');
var guid = require('guid');
var Ebay = require('ebay');
var url = require('url');
var context = require('rabbit.js').createContext('amqp://guest:guest@localhost');
//var context = require('rabbit.js').createContext('amqp://yncidqyc:JH4x2YLUR_vyn4Y1CP2P6GyCHlvi96r8@owl.rmq.cloudamqp.com/yncidqyc');

var push = context.socket('PUSH');
var pushImg = context.socket('PUSH');
var pull = context.socket('PULL');

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
    key: 'AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4',
    cx: '017135603890338635452:l5ri3atpm-y'
});
var GoogleImageSearch = require('./google-image-search.js');
var Search = require('./google_search.js');


var ebay = new Ebay({
    app_id: 'JODOS-TE-0e9b-4bbc-9101-1c79d952427c'
});

var io = require('socket.io')(server);
var socketGlobal = [];


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/search=:id', function(req, res) {
    var id = parseInt(req.params.id);
    var searchText = 'iphone';

    res.sendFile(__dirname + '/search.html');
});

app.post('/api/items/guid', function(req, res) {
    //res.sendFile(__dirname + '/index1.html');
    var myGUID = guid.raw();
    console.log('genrate new guid - ' + myGUID);

    res.end(myGUID);

});

app.post('/api/items', function(req, res) {
    //var searchText = req.body.searchtext;
    //var guid = req.body.guid;

    if (!req.body)
        return res.sendStatus(400)

    //var ebayText = escape(req.body.searchtext);
    var ebayText = unescape(req.body.searchtext).trim();


    res.header('Content-type', 'application/json');
    res.header('Charset', 'utf8');

    // console.log('SearchTExt - ' + ebayText);

    ebaySearch(ebayText, function(data) {
        // console.log(data);
        res.jsonp(data);
    });

});

app.post('/api/items/google', function(req, res) {

});

function publishToSocket(obj) {

    var domain = url.parse(obj.Url).host;

    if (typeof socketGlobal[obj.Token] != 'undefined') {

        var socket = socketGlobal[obj.Token];

        socket.emit('chat message', [{
            Name: domain,
            ItemUrl: obj.Url,
            ItemMinPrice: obj.predictMinPrice,
            ItemMaxPrice: obj.predictMaxPrice,
            Avg: obj.predictMinPrice,
            isSellSite: obj.isSellSite
        }]);

        //console.log('send to socket with guid - ' + obj.Token);
    } else {
        console.log(obj.Token + 'is not my GUID !!!');
    }
}


function pullMessages() {
    console.log('in the pullMessages');
    pull.connect('FinalOUT');

    pull.on('data', function T(data) {
        var inMsg = JSON.parse(data);
        //console.log('@@@@@@@@@@@@@@@@@@@@@');
        //console.log(inMsg);

        publishToSocket(inMsg);
        //console.log(JSON.stringify(data));
    });

}

pullMessages();


function googleSearch22(searchtext, cb) {

    var numOfPages = 4;
    var allUrls = [];
    var count = 0;

    for (var i = 0; i < numOfPages; i++) {

        googleSearch.build({
            q: searchtext,
            start: i * 10,
            num: 10,
            fields: "items/link"
        }, function(error, response) {
            // console.log(response.items);


            count++;
            response.items.forEach(function(entity) {
                allUrls.push(entity.link);
                //  console.log('count=' + count + ' - ' + allUrls.length + '# - ' + entity.link);
            });

            if (count == numOfPages) {
                return cb(allUrls);
            }
        });
    }
}

function googleSearch1(searchtext, start, cb) {

    googleSearch.build({
        q: searchtext,
        start: start,
        num: 10,
        fields: "items/link"
    }, function(error, response) {

        //console.log(response);
        return cb(response);
    });
}

function ebaySearch(searchtext, cb) {

    var myResult = [];
    var params = {
        'OPERATION-NAME': 'findItemsByKeywords',
        'keywords': searchtext
    }

    ebay.get('finding', params, function(err, data) {
        if (err)
            throw err

        if (data.findItemsByKeywordsResponse[0].ack[0] === 'Success') {

            var items = data.findItemsByKeywordsResponse[0].searchResult[0].item;
            var curItem;

            items.forEach(function(entity) {
                curItem = {};

                curItem.ItemUrl = entity.viewItemURL[0];
                if (entity.galleryURL === undefined) {
                    curItem.ImageUrl = "noimg.jpg"
                } else {
                    curItem.ImageUrl = entity.galleryURL[0];
                }
                curItem.ItemPrice = entity.sellingStatus[0].currentPrice[0].__value__;

                if (entity.shippingInfo[0].shippingServiceCost == undefined)
                    curItem.ShippingPrice = "0.0";
                else
                    curItem.ShippingPrice = entity.shippingInfo[0].shippingServiceCost[0].__value__;
                curItem.Name = entity.title[0];
                curItem.Source = "eBay";

                myResult.push(curItem);
            });
        }

        return cb(myResult);
    });
}


app.get('/getebay', function(req, res) {
    res.header('Content-type', 'application/json');
    res.header('Charset', 'utf8');

    //res.jsonp(ebaySearch('iphone',null));

    ebaySearch('iphone', function(data) {
        res.jsonp(data);
    });


});


app.get('/endpoint', function(req, res) {
    var obj = {};
    obj.title = 'koko';
    obj.data = 'mamama';

    console.log('params: ' + JSON.stringify(req.params));
    console.log('body: ' + JSON.stringify(req.body));
    console.log('query: ' + JSON.stringify(req.query));

    res.header('Content-type', 'application/json');
    res.header('Charset', 'utf8');
    //res.send(req.query.callback + '('+ JSON.stringify(obj) + ');');
    res.jsonp(obj)
});



io.on('connection', function(socket) {
    //  socketGlobal.push(socket);
    console.log('user connected - socket saved - ' + socket);

    socket.on('disconnect', function(socket) {
        //   socketGlobal.pop(socket);
        // console.log(socketGlobal);
        //console.log(socket);

        // var index = socketGlobal.indexOf(socket);
        //console.log('b4 - ' + index);
        //socketGlobal.splice(index, 1);

        // var index = socketGlobal.indexOf(socket);
        // console.log('after - ' + index);

        console.log('there is a sockect who wants to disconnect ... ');

        // TODO:  fix this is not working !!
        // We cant find valuse in array so easly...

        /*console.log(socketGlobal.length);


        var count = 0;
        socketGlobal.forEach(function(entry) {
            count++;


            if (entry === socket) {
                console.log('user disconnected - socket removed.');
            } else {
                console.log('did not find socket.');
            }
        });*/

    });


    socket.on('newSearch', function(mySearch) {

        if (mySearch.txt === undefined) {} else {
            //console.log('old GUIDD was - ' + mySearch.guid);
            //console.log(Object.keys(socketGlobal).length);
            //console.log(Object.keys(socketGlobal).length);
            //console.log(Object.keys(socketGlobal));

            // console.log('mySearch: ' + mySearch);
            var myGUID = guid.raw();
            socketGlobal[myGUID] = socket;

            console.log('New myGUID = ' + myGUID);

            Search.getResultsFromGoogle(mySearch.txt, 5, function(data) {
                push.connect('TEST1', function() {
                    data.forEach(function(item) {
                        var obj = {};

                        obj.Url = item;
                        obj.Price = mySearch.price;
                        obj.Token = myGUID;
                       // obj.Engine = 'GoogleSearch';

                        push.write(JSON.stringify(obj));
                    });
                });
            });


            if (mySearch.imgUrl != "noimg.jpg") {
                GoogleImageSearch.GetAllUrls(mySearch.imgUrl, null, function(data1) {
                console.log('data1 ' , data1);

                    pushImg.connect('TEST1', function() {
                        data1.forEach(function(item) {
                            var obj = {};

                            obj.Url = item;
                            obj.Price = mySearch.price;
                            obj.Token = myGUID;
                            console.log('obj ' , obj);
                            //obj.Engine = 'GoogleImageSearch';

                            pushImg.write(JSON.stringify(obj));
                        });
                    });
                });
            }

            // send the user the new guid to remove it on next search .. 
            socket.emit('updateGuid', myGUID);
        }
    });

});

app.get('/emit', function(req, res) {
    console.log('num of online clients - ' + socketGlobal.length);
    socketGlobal.forEach(function(entry) {
        entry.emit('chat message', [{
            Name: 'fdsfs',
            ImageUrl: 'http://st1.foodsd.co.il/Images/Products/large/hagiSJ2GI3.jpg',
            ItemUrl: 'http://fdfs.com',
            ItemPrice: 4.4,
            ShippingPrice: 3.4,
            Source: 'Mantz'
        }]);
        console.log('send to socket');
    });

    res.end('emit to clients - ' + socketGlobal.length);
});

app.get('/status', function(req, res) {

    /*if (socketGlobal != undefined) {

        res.jsonp(Object.values(socketGlobal));
        console.log(Object.keys(socketGlobal));
    }*/
});

server.listen(3000, function() {
    console.log("Started on PORT 3000");
})

app.use(express.static('public'));
