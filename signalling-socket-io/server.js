var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
socketIdMapping = {};
clientIdMapping = {};
app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});

io.on('connection', function(socket){
  console.log("socket.id ::",socket.id);
  socketIdMapping[socket.id] = socket;
  
  socket.on('register', function(id){
	console.log("Registering ",id);
	console.log("Assigning connection id ",socket.id);
	clientIdMapping[id] = socketIdMapping[socket.id];
	clientIdMapping[id].emit('register', "SUCCESS");
  });
  
  socket.on('message', function(msg){
	console.log(socket.id, msg);
    var client = clientIdMapping[msg.to];
	client.emit('message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});