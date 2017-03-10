socket = require('socket.io-client')('http://127.0.0.1:3000')
var userId = 'yliu-participant'
var businessId = 'Yelp biz'
var roomId = 'SJesjh1jl'

socket.on('updateGameState', function(msg) {
  console.log(msg);
})

socket.on('gameEnd', function(msg) {
  console.log('game over')
  console.log(msg)
})

socket.emit('join', {roomId: roomId, userId: userId, businessId: businessId});

socket.emit('score', {roomId: roomId, userId: userId, score: 1});

// Uncomment to simulate player dying
// socket.emit('died', {roomId: roomId, userId: userId});
