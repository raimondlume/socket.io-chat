$(function() {
  let socket = io();
  let users = [];

  $("#chat-screen").hide();

  $("#user-login").click(function(e) {
    e.preventDefault(); // prevents page reloading
    let username = $("#username").val().trim();
    if (username.length < 1) return false;

    users = getUsers();
    if (users.includes(username)) {
      $("#username-taken").show();
      return false;
    }
    socket.emit("user joined", username);
    $("#login-screen").hide();
    $("#chat-screen").show();
    return false;
  });

  $("#message-send").click(function(e) {
    e.preventDefault();// prevents page reloading
    let $message = $('#message');
    let messageText = $message.val().trim();
    if (messageText.length < 1) return;
    $message.val("");
    socket.emit("message", messageText);
  });

  socket.on('user joined', function (username) {
    console.log(`${username} joined`);
    renderUserTable();
  });

  socket.on('user left', function (username) {
    console.log(`${username} left`);
    renderUserTable();
  });

  socket.on('message', function (messageData) {
    console.log("got message");
    let user = messageData.user;
    let text = messageData.text;
    let currentDate = new Date().toLocaleString();
    let tableRow = $('<tr>')
      .append($('<td>').append(`${user}`))
      .append($('<td>').append(`${text}`))
      .append($('<td>').append(`${currentDate}`));
    $('#message-table').append(tableRow);
  });

  function getUsers() {
    let res = [];
    $.ajax({
      url: '/users',
      success: function (response) {
        if (response.length === 0) return res;
        for (let i = 0; i < response.length; i++) {
          res.push(response[i]);
        }
      },
      async: false
    });
    return res;
  }

  function renderUserTable() {
    let userTable = $("#user-table");
    userTable.empty();
    users = getUsers();
    users.forEach(function (value, index) {
      let tableRow = $('<tr>').append($('<td>').append(value));
      userTable.append(tableRow);
    })
  }
});