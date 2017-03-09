'use strict'

var socket = require('socket.io-client')('http://127.0.0.1:3000')
socket.on('connect', function () { console.log("socket connected!"); })
socket.emit('join', { user: 'me', msg: 'whazzzup?' })