var express = require('express'),
    passport = require('passport'),
    util = require('util'),
    FacebookStrategy = require('passport-facebook').Strategy,
    logger = require('morgan'),
    session = require('express-session'),
    cookieParser = require("cookie-parser"),
    methodOverride = require('method-override');

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

var favorite = require('./favorite');

/*process.on('uncaughtException', function(err) {
  console.log(err);
});*/

var FACEBOOK_APP_ID = "855929681108893"
var FACEBOOK_APP_SECRET = "6cfb0b86b713ad134a7af729e871aba3";

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Final');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {

            // To keep the example simple, the user's Facebook profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Facebook account with a user record in your database,
            // and return that user instead.

            return done(null, profile);
        });
    }
));

app.use(logger());
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({
    secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log("Not Auth!");
}






// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res) {
        // The request will be redirected to Facebook for authentication, so this
        // function will not be called.
    });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        console.log("login secsusfuly!");
        console.log(req.user);
        res.redirect('/');
    });

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

    console.log('SearchTExt - ' + ebayText);

    ebaySearch(ebayText, res, function(data) {
        res.jsonp(data);
    });

});




app.post('/api/items/google', function(req, res) {

    var searchtext = req.body.searchtext;
    var imgUrl = req.body.imgUrl;
    var price = req.body.Price;
    var guid = req.body.Guid;
    //console.log('text:' + searchtext + ' price:' + price + 'imgUrl: ' + imgUrl + ' Guid: ' + guid);


    var numOfPages = 4;

});

app.post('/api/favorite/add', function(req, res) {

    if (req.isAuthenticated()) {
        var searchtext = req.body.searchtext;
        var itmUrl = req.body.itmUrl;
        var Currprice = req.body.Price;
        var description = req.body.desc;

        var tempFavo = new favorite({
            name: searchtext,
            price: Currprice,
            ItemUrl: itmUrl,
            Desc: description,
            UserId: req.user.id
        });

        tempFavo.save(function(results) {
            res.json({});
        });
    }


});

app.post('/api/favorite/update', function(req, res) {


    var id = req.body.id;
    var description = req.body.desc;
    console.log(id + " " + description);
    favorite.update({
        _id: id
    }, {
        $set: {
            Desc: description
        }
    }, function(err) {
        console.log(err);
    });




});


app.get('/api/favorite', function(req, res) {

    if (req.isAuthenticated()) {

        favorite.find({
            UserId: req.user.id
        }, function(err, results) {
            res.json(results);
        });
    }


});

app.get('/api/favorite/group', function(req, res) {

    if (req.isAuthenticated()) {

        favorite.aggregate({
                $group: {
                    _id: '$UserId',
                    total_favorites: {
                        $sum: 1
                    }
                }
            },
            function(err, results) {
                res.json(results);
            }
        );
    }


});

app.post('/api/favorite/delete', function(req, res) {

    if (req.isAuthenticated()) {
        var id = req.body.id;
        favorite.remove({
            _id: id
        }, function(err, results) {
            res.json({});
        });
    }


});


function publishToSocket(obj) {

    var domain = url.parse(obj.Url).host;

    if (typeof socketGlobal[obj.Token] != 'undefined') {

        var socket = socketGlobal[obj.Token];

        // console.log(socketGlobal);
        // console.log('obj.Token - ' + obj.Token);
        //console.log('socketGlobal[obj.Token] - ' + socket);

        socket.emit('chat message', [{
            Name: domain,
            ImageUrl: 'http://st1.foodsd.co.il/Images/Products/large/hagiSJ2GI3.jpg',
            ItemUrl: obj.Url,
            ItemPrice: obj.predictMinPrice + " - " + obj.predictMaxPrice,
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

function ebaySearch(searchtext, res, cb) {

    console.log('ebaySearch(' + searchtext + ')');

    var myResult = [];
    var params = {
        'OPERATION-NAME': 'findItemsByKeywords',
        'keywords': searchtext
    }

    ebay.get('finding', params, function(err, data) {
        if (err) {
            res.status(500).send('Something broke!');
            return;
        }


        console.log(data.findItemsByKeywordsResponse[0].ack[0] === 'Success');
        if (data.findItemsByKeywordsResponse[0].ack[0] === 'Success') {

            var items = data.findItemsByKeywordsResponse[0].searchResult[0].item;
            var curItem;

            items.forEach(function(entity) {
                curItem = {};

                curItem.ItemUrl = entity.viewItemURL[0];
                curItem.ImageUrl = entity.galleryURL[0];
                curItem.ItemPrice = entity.sellingStatus[0].currentPrice[0].__value__;
                // curItem.ShippingPrice = "0";
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



app.get('/getLoginUser', function(req, res) {
    if (req.isAuthenticated()) {
        res.jsonp({
            "user": req.user
        });
    } else {
        res.jsonp("");
    }
});

app.get('/getebay', function(req, res) {
    res.header('Content-type', 'application/json');
    res.header('Charset', 'utf8');

    //res.jsonp(ebaySearch('iphone',null));

    ebaySearch('iphone', function(data) {
        // console.log(data);
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
            console.log('old GUIDD was - ' + mySearch.guid);
            console.log(Object.keys(socketGlobal).length);
            //  socketGlobal.pop(mySearch.guid);
            // delete socketGlobal[mySearch.guid];
            console.log(Object.keys(socketGlobal).length);
            console.log(Object.keys(socketGlobal));

            // console.log('mySearch: ' + mySearch);
            var myGUID = guid.raw();
            socketGlobal[myGUID] = socket;


            console.log('New myGUID = ' + myGUID);
            // console.log(socketGlobal);
            //console.log(socketGlobal.length);

            Search.getResultsFromGoogle(mySearch.txt, 5, function(data) {
                push.connect('TEST1', function() {
                    data.forEach(function(item) {
                        var obj = {};

                        obj.Url = item;
                        obj.Price = mySearch.price;
                        obj.Token = myGUID;
                        push.write(JSON.stringify(obj));
                    });
                });
            });

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
    res.jsonp(Object.values(socketGlobal));
    console.log(Object.keys(socketGlobal));
    //res.end();
});

server.listen(3000, function() {
    console.log("Started on PORT 3000");
})

app.use(express.static('public'));
