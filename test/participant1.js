socket = require('socket.io-client')('http://127.0.0.1:3000')
var userId = 'yliu-participant'
var businessId = 'Yelp biz'
var roomId = '123'

socket.on('updateGameState', function(msg) {
  console.log(msg);
})

socket.on('errorState', function(msg) {
  console.log(msg)
})

socket.on('gameEnd', function(msg) {
  console.log('game over')
  console.log(msg)
})

socket.emit('join', {roomId: roomId, userId: userId, businessId: businessId});

setTimeout(function() {
  socket.emit('score', {userId: userId, score: 1});
}, 4000)


setTimeout(function() {
  socket.emit('died', {userId: userId});
}, 6000)
