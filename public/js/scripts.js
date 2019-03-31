$(function() {
  let socket = io();
  let users = [];
  let timeout;

  $("#chat-screen").hide();

  $("#user-login").click(function(e) {
    $("#username-empty").hide();
    $("#username-taken").hide();

    e.preventDefault(); // prevents page reloading
    let username = $("#username").val().trim();
    if (username.length < 1) {
      $("#username-empty").show();
      return false;
    }

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
    renderUserTable();
  });

  socket.on('user left', function (username) {
    renderUserTable();
  });

  socket.on('message', function (messageData) {
    let user = messageData.user;
    let text = messageData.text;
    let currentDate = new Date().toLocaleTimeString();

    createMessageBubble(user, text, currentDate);

    let tableRow = $('<tr>')
      .append($('<td>').append(`${user}`))
      .append($('<td>').append(`${text}`))
      .append($('<td>').append(`${currentDate}`));
    $('#message-table').append(tableRow);
  });

  $('#message').keyup(function () {
    socket.emit('user typing', true);
    clearTimeout(timeout);
    timeout = setTimeout(timeoutCallback, 3000)
  });

  socket.on('user typing', function (data) {
    if (data.typing) {
      $(`#${data.username}`).show()
    } else {
      $(`#${data.username}`).hide()
    }
  });

  function timeoutCallback() {
    socket.emit('user typing', false);
  }

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
      let userRow = $('<div>')
        .append($('<i>').addClass("far fa-user"))
        .append($('<span>').append(value).addClass('user-table-text'))
        .append($('<span>').append('<i>is typing...</i>').attr('id', value).addClass('is-typing-label'));
      userTable.append(userRow);
    })
  }

  function createMessageBubble(user, text, time) {
    let $messageContainer = $('.message-container');

    let messageDiv = $('<div>');
    let userLabel = $('<span>').append(`<strong>${user}</strong> <i>at ${time}</i>`);
    let textContainer = $('<div>').append(`<p>${text}</p>`);

    messageDiv.addClass('message-bubble');
    userLabel.addClass('message-sender');
    textContainer.addClass('message-text');

    messageDiv.append(userLabel);
    messageDiv.append(textContainer);

    $messageContainer.prepend(messageDiv);
  }
});