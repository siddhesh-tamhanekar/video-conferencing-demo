
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var http = require('http').Server(app);

var https = require('https');

var fs = require('fs');

var ioServer = require('socket.io');

var io = new ioServer();

io.set('origins', '*:*');

const pkey = fs.readFileSync('./ssl/private.key'),
  pcert = fs.readFileSync('./ssl/certificate.crt'),
  options = {key: pkey, cert: pcert};

var sslServer = https.createServer(options, app).listen(4443,function () {
  console.log("The HTTPS server is up and running on port https://127.0.0.1:4443");
});


http.listen(3000, function(){
  console.log('listening on http://127.0.0.1:3000');
});

io.attach(http);
io.attach(sslServer);

// cors allow.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(express.static('js'))

// homepage hit.

app.get('/', function(req, res){
  res.sendFile(__dirname+"/video.html");
});


io.on('connection',function (socket) {

  socket.on('disconnect', function(){

});


  socket.on('video',function(msg){
    socket.broadcast.emit("video",msg)
  });

  socket.on('call',function(req){

    socket.broadcast.emit("call")
  });

  socket.on("acceptCall", function(req) {
      socket.broadcast.emit("acceptCall");
  })

  socket.on("endCall", function(req) {
      socket.broadcast.emit("endCall");
  })

  socket.on("message",function(msg){
    console.log("forwarding",msg,"to other user");
    socket.broadcast.emit("message",msg);
  })


});


