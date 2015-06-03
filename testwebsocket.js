var express = require("express");
var app = express();
var http = require('http');
var https = require('https');
var server = http.Server(app);
var io = require('socket.io')(server);
var socketGlobal = [];



io.on('connection', function (socket) {
  socketGlobal.push(socket);
  console.log('user connected - socket saved - ' + socket);

  socket.on('disconnect', function (socket) {
    socketGlobal.pop(socket);
    console.log('user disconnected - socket removed.');
  });

});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
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



