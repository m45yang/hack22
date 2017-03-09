'use strict'

var restify = require('restify')
restify.errors = require('restify-errors')
var plugins = require('restify-plugins')
var socketio = require('socket.io')
var config = require('./config')

var host = 'localhost'
var port = process.env.PORT || 3000

var server = restify.createServer({
  name: 'Yelpick',
  socketio: true
})

// Default http helpers/handlers
server.use(plugins.queryParser())
server.use(plugins.jsonBodyParser({
  mapParams: true
}))

server.config = config

// Enable basic logging
require('./logger')(server)

// Connect to mongodb
require('./mongoose')(server)

// Install sockets
require('./sockets/index')(server)

server.listen(port, host, function listening() {
  server.log.info(server.name + ' running: ' + host + ':' + port)
})

module.exports = server