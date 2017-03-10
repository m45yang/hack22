socket = require('socket.io-client')('http://127.0.0.1:3000')
var another_user_id = 'yliu-2'
var biz_id = 'Yelp biz'
var room_id = 'rysStikig'
socket.emit('join', {room_id:room_id, user_id:another_user_id, business_id:biz_id});

socket.on('join_result', function(msg) {
  console.log(msg);
  socket.emit('ready', {user_id: msg.user_id, room_id: msg.room_id})
})

socket.on('info', function(msg) {
  console.log(msg);
})

socket.on('game start', function() {
  console.log('game start')
})

socket.emit('score', {room_id:room_id, user_id: another_user_id, score: 1});

socket.emit('died', {room_id: room_id, user_id: another_user_id});

socket.on('died_result', function(msg) {
  console.log(msg)
})

socket.on('result', function(msg){
  console.log(msg)
})
