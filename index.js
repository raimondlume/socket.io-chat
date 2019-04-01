let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = 3000;

let md = require('markdown-it')({
  linkify: true
});

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
    let mdText = md.render(msg);
    io.emit('message', {user: socket.username, parsedText: mdText, plaintext: msg});
  });

  socket.on('user typing', function (isTyping) {
    io.emit('user typing', { username: socket.username, typing: isTyping});
  })
});

http.listen(process.env.PORT || port, function () {
  console.log(`Server started at localhost:${port}`)
});