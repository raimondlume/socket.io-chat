let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

// serve bulma css file from node_modules
app.use('/css', express.static(__dirname + '/node_modules/bulma/css/'));
// serve public html/js files
app.use(express.static('public'));

let users = [];

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html')
});

app.get('/users', function (req, res) {
  res.send(users);
});

io.on('connection', function (socket) {
  console.log('a user connected');

  socket.on('user joined', function (username) {
    socket.username = username;
    console.log(`${socket.username} joined!`);
    users.push(socket.username);
    io.emit('user joined', socket.username);
  });

  socket.on('disconnect', function () {
    users.splice(users.indexOf(socket.username), 1);
    io.emit('user left', socket.username);
    console.log(`${socket.username} disconnected!`);
  });

  socket.on('message', function (msg) {
    console.log('message: ' + msg);
    // socket.broadcast.emit('chat message', msg);
    io.emit('message', {user: socket.username, text: msg});
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000')
});