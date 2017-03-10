'use strict'

var socket = require('socket.io-client')('http://127.0.0.1:3000')
socket.on('connect', function () { console.log("socket connected!"); })
// socket.emit('join', { user: 'me', msg: 'whazzzup?' })
console.log('test host create room');
var user_id = 'yliu-test';
var biz_id = 'Yelp';
var room_id = '';
socket.emit('create', {user_id: user_id, business_id: biz_id});

socket.on('create_result', function(msg) {
  console.log('room created with id %s', msg.room_id);
  room_id = msg.room_id;
});

socket.on('info', function(msg) {
  console.log(msg)
})

socket.on('game start', function() {
  console.log('game start!')
})
