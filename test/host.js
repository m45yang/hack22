'use strict'

var socket = require('socket.io-client')('http://127.0.0.1:3000')
socket.on('connect', function () { console.log("socket connected!") })
var userId = 'yliu-host'
var businessId = 'Yelp'
var roomId = ''

socket.on('updateGameState', function(msg) {
  console.log(msg)
})

socket.on('gameEnd', function(msg) {
  console.log('game over')
  console.log(msg)
})


socket.emit('create', {userId: userId, businessId: businessId})

// socket.emit('score', {roomId: roomId, userId: userId, score: 100})
