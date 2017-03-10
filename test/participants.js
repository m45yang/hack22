socket = require('socket.io-client')('http://127.0.0.1:3000')
var another_user_id = 'yliu-2'
var biz_id = 'Yelp biz'
var room_id = 'H1E8-Kysxg'
socket.emit('join', {room_id:room_id, user_id:another_user_id, business_id:biz_id});

socket.on('join_result', function(msg) {
  cosole.log(msg);
  socket.emit('ready', {user_id: user_id, room_id: room_id})
})

socket.on('info', function(msg) {
  console.log(msg);
})

socket.on('game start', function() {
  cosole.log('game start')
})
