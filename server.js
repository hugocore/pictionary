var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(55555);
app.use(express.logger());
app.use(express.static(__dirname + '/'));

// Webserver
function handler (req, res) {

	var url = "";
	if (req['url'] == "/")
		url = "/index.html";
  	else
  		url = req['url'];

  	console.log("URL:" + req['url']);

  	if (fs.existsSync(__dirname + url)) {

		fs.readFile(__dirname + url, function (err, data) {
			if (err) {
			  res.writeHead(500);
			  console.log('Error loading ' + url);
			  return res.end('Error loading ' + url);			  
			}

			res.writeHead(200);
			res.end(data);
		});

	}
}

var users = [];
var traces = [];

// Socket server
io.sockets.on('connection', function(socket) {

	// When a new player arrive
	socket.on('newPlayer', function (data) {
	
		if (traces.length>0) {
			for (var i=0; i<traces.length; i++)
				socket.emit('newPoints', {nick:"", points: traces[i]});
		}

		// Update the other users
		socket.broadcast.emit('newPlayer', data);
		
	});
	
	// When new points arrive
	socket.on('newPoints', function (data) {

		// Update the other users
		socket.broadcast.emit('newPoints', data);		
		
	});

	// When the canvas get cleread
	socket.on('clearDraw', function () {

		// Clear local points
		traces = [];

		// Update the other users
		socket.broadcast.emit('clearDraw');		
		
	});
	
	// When new points needs to be saved
	socket.on('updatePoints', function (data) {

		if (data['points'].length>0)
			traces.push(data['points']);
		
	});

	// When a user leaves
	socket.on('disconnect', function () {

	});

});