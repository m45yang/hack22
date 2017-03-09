'use strict'

var socketio = require('socket.io')

var initSockets = function(server) {

    var io = socketio.listen(server.server)

    // Define socket events here
    io.sockets.on('connection', function (socket) {
        console.log('connected!')
        socket.emit('news', { hello: 'world' })

        socket.on('join', function (data) {
            console.log(data)
        })

        socket.on('disconnect', function() {
            console.log('disconnected')
        })
    })
}

module.exports = initSockets