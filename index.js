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
var context = require('rabbit.js').createContext('amqp://10.0.0.9');
//var context = require('rabbit.js').createContext('amqp://owl.rmq.cloudamqp.com/yncidqyc');

var push = context.socket('PUSH');
var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: 'AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4',
  cx: '017135603890338635452:l5ri3atpm-y'
});


var ebay = new Ebay({
  app_id: 'JODOS-TE-0e9b-4bbc-9101-1c79d952427c'
});

var io = require('socket.io')(server);
var socketGlobal = [];


console.log('soekct  - ' + io);
// WORKING WITH AMQC CLOUD
//var amqp = require('amqp'); 
//var connection = amqp.createConnection({url: "amqp://yncidqyc:JH4x2YLUR_vyn4Y1CP2P6GyCHlvi96r8@owl.rmq.cloudamqp.com/yncidqyc"});

//var q = connection.queue('my-queue', function (queue) {
//  console.log('Queue ' + queue.name + ' is open');
//});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded






app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/search=:id', function (req, res) {
  var id = parseInt(req.params.id);
  var searchText = 'iphone';

  res.sendFile(__dirname + '/search.html');
});

app.post('/api/items/guid', function(req, res){
  //res.sendFile(__dirname + '/index1.html');
  var myGUID = guid.raw();
  console.log('genrate new guid - ' + myGUID);

  res.end(myGUID);

});

app.post('/api/items',function (req,res) {
  //var searchText = req.body.searchtext;
  //var guid = req.body.guid;

  if (!req.body) 
    return res.sendStatus(400)
  
  var resDani = req.body;

  res.header('Content-type','application/json');
  res.header('Charset','utf8');


 ebaySearch(resDani.searchtext,function(data){
 // console.log(data);
  res.jsonp(data);
});

});

app.post('/api/items/google', function (req,res){

  var searchtext = req.body.searchtext;
  var price = req.body.Price;
  var guid = req.body.Guid;
  console.log('text:' + searchtext + ' price:' + price);

  googleSearch1(searchtext,function(data){
    //console.log(data);

    res.header('Content-type','application/json');
    res.header('Charset','utf8');
   
    push.connect('TEST1', function() {              
      data.items.forEach(function(item){
      var obj = {};
      obj.Url = item.link;
      obj.Price = price;
      obj.Token = guid;
      push.write(JSON.stringify(obj));  
    });
      
    });

    res.jsonp(data);
  });

});



function googleSearch1(searchtext, cb){

  googleSearch.build({
    q: searchtext,
    num: 10,
    fields: "items/link"
  }, function(error, response) {
    

   return cb(response);
  });
}

function ebaySearch(searchtext, cb){
  var myResult = [];
  var params = {
    'OPERATION-NAME': 'findItemsByKeywords'
    , 'keywords': searchtext
  }

  ebay.get('finding', params, function (err, data) {
    if(err) throw err


     var items = data.findItemsByKeywordsResponse[0].searchResult[0].item;

   
   var curItem;

   items.forEach(function (entity) {
    curItem = {};

    curItem.ItemUrl = entity.viewItemURL[0];
    curItem.ImageUrl = entity.galleryURL[0];
    curItem.ItemPrice =entity.sellingStatus[0].currentPrice[0].__value__;
   // curItem.ShippingPrice = "0";
   if(entity.shippingInfo[0].shippingServiceCost == undefined)
    curItem.ShippingPrice = "0.0";
  else
    curItem.ShippingPrice = entity.shippingInfo[0].shippingServiceCost[0].__value__;  
  curItem.Name = entity.title[0];
  curItem.Source = "eBay";

  myResult.push(curItem);
});

   return cb(myResult);
 });
}


app.get('/getebay', function (req, res) {
  res.header('Content-type','application/json');
  res.header('Charset','utf8');

    //res.jsonp(ebaySearch('iphone',null));

    ebaySearch('iphone',function(data){
      console.log(data);
      res.jsonp(data);
    });


  });



/*
app.post('/login',function (req,res){
  var user_name=req.body.user;
  var password=req.body.password;

  console.log("search: " + req.body.search);
  console.log("User name = "+user_name+", password is "+password);

  res.end("yes");
});*/

app.get('/endpoint', function(req, res){
  var obj = {};
  obj.title = 'koko';
  obj.data = 'mamama';

  console.log('params: ' + JSON.stringify(req.params));
  console.log('body: ' + JSON.stringify(req.body));
  console.log('query: ' + JSON.stringify(req.query));

  res.header('Content-type','application/json');
  res.header('Charset','utf8');
  //res.send(req.query.callback + '('+ JSON.stringify(obj) + ');');
  res.jsonp(obj)
});



io.on('connection', function (socket) {
  socketGlobal.push(socket);
  console.log('user connected - socket saved - ' + socket);

  socket.on('disconnect', function (socket) {
    socketGlobal.pop(socket);
    console.log('user disconnected - socket removed.');
  });

});

app.get('/emit', function(req, res){
  socketGlobal.forEach(function (entry) {
      entry.emit('chat message', 'TEST');
      console.log('send to socket');
    });

  res.end('emit clients');
});



server.listen(3000,function(){
  console.log("Started on PORT 3000");
})


app.use(express.static('public'));



