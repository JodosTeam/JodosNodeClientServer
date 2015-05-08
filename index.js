//var express =require('express');
var express = require("express");
var bodyParser = require("body-parser");
//var app = require('express')();
var app = express();
var http = require('http');
var https = require('https');
var server = http.Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
  console.log('user connected');
});

app.get('/index1.html', function(req, res){
  res.sendFile(__dirname + '/index1.html');
  console.log('user connected');
});

app.get('/index3.html', function(req, res){
  res.sendFile(__dirname + '/index3.html');
  console.log('user connected');
});

app.get('/search=:id', function (req, res) {
  var id = parseInt(req.params.id);
  var searchText = 'iphone';

  res.sendFile(__dirname + '/search.html');
});

app.get('/getdata', function (req, res) {
  var id = parseInt(req.params.id);
  var searchText = 'iphone';
    //var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4&cx=017135603890338635452:l5ri3atpm-y&q=" +"buy "+searchText + "&fields=items/link";
    var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4&cx=017135603890338635452:l5ri3atpm-y&q=buy%20ip&fields=items/link";
    console.log(url);

    var url2  ="http://www.google.com/index.html";

    var resData = [];
   /* http.get(url2, function(res) {
      console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });*/



var options = {
  hostname: 'www.googleapis.com',
  port: 443,
  path: '/customsearch/v1?key=AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4&cx=017135603890338635452:l5ri3atpm-y&q=buy%20ip&fields=items/link',
  method: 'GET'
};

var req = https.request(options, function(res) {
    //console.log("statusCode: ", res.statusCode);
    //console.log("headers: ", res.headers);

    res.on('data', function(d) {
    // process.stdout.write(d);
    resData = d;
      //console.log('d = ' + d);
    });
  });

console.log('b4  end');
    //req.end();
    console.log('after end');
    

    res.on('end', function (result) {
      console.log('end to end');

      res.header('Content-type','application/json');
      res.header('Charset','utf8');
      res.jsonp(resData);
    });

    req.on('error', function(e) {
      console.error(e);
    });



  });

app.post('/login',function (req,res){
  var user_name=req.body.user;
  var password=req.body.password;

  console.log("search: " + req.body.search);
  console.log("User name = "+user_name+", password is "+password);

  res.end("yes");
});

app.post('/api/items',function (req,res) {
  var searchText = req.body.search;
  var obj = {};
  obj.title = 'koko';
  obj.data = 'mamama';

  console.log('POST! ');

  res.header('Content-type','application/json');
  res.header('Charset','utf8');

 // console.log(req.route);

  console.log(searchText);
  console.log(GetFromGoogle(searchText));

  //res.jsonp(JSON.parse(obj));
  //res.sendFile(__dirname + 'display.html');
  res.json(obj);

  //res.render('testFun',{ mess : JSON.stringify(obj) });

  /*res.writeHead(302, {
  'Location': '/api/items2'
    //add other headers here...
  });
res.end();*/
});

app.get('/api/items2', function (req, res) {
  var resData = [];
  var obj = {};
  obj.title = 'koko';
  obj.data = 'mamama';

  var options = {
   hostname: 'www.googleapis.com',
   port: 443,
   path: '/customsearch/v1?key=AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4&cx=017135603890338635452:l5ri3atpm-y&q=buy%20ip&fields=items/link',
   method: 'GET'
 };

 var req2 = https.request(options, function(res2) {
    //console.log("statusCode: ", res2.statusCode);
    //console.log("headers: ", res2.headers);

    res2.on('data', function(chunk) {
      //process.stdout.write(chunk);
      resData += chunk;
    });

    res2.on('end', function(d) {
      console.log('END!');
      res.header('Content-type','application/json');
      res.header('Charset','utf8');
      //console.log( JSON.parse(resData));
      res.jsonp(JSON.parse(resData));
    });
  });
 req2.end();

 req2.on('error', function(e) {
  console.error(e);
}); 
});

function GetFromGoogle(searchText)
{
  var resData = [];
  var options = {
   hostname: 'www.googleapis.com',
   port: 443,
   path: '/customsearch/v1?key=AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4&cx=017135603890338635452:l5ri3atpm-y&q=buy ' +searchText+'&fields=items/link',
   method: 'GET'
 };

 var req2 = https.request(options, function(res2) {
    res2.on('data', function(chunk) {
      console.log(chunk);
      resData += chunk;
    });

    res2.on('end', function(d) {
      console.log('END!');
      return resData;
    });
  });
  req2.end();

  req2.on('error', function(e) {
    console.error('GetFromGoogle https req error - ' + e);
  });
}

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

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('he wrote msg');
    console.log('message: ' + msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('lala1', function(msg){
    console.log('user lala1');
    io.emit('lala1', msg);
  });

});

/*
server.listen(3000, function(){
  console.log('listening on *:3000');
});*/


app.listen(3000,function(){
  console.log("Started on PORT 3000");
})


app.use(express.static('public'));



// http.createServer(function (request, response) {
/*
server.listen(3000, function(request, response) {

 console.log('request starting...');
console.log(url);

var filePath = '.' + request.url;
if (filePath == './')
filePath = './index.htm';

path.exists(filePath, function(exists) {

if (exists) {
fs.readFile(filePath, function(error, content) {
  if (error) {
    response.writeHead(500);
    response.end();
  }
  else {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(content, 'utf-8');
  }
});
}
else {
response.writeHead(404);
response.end();
}
});

}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');*/