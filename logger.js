'use strict'

/**
 * Initialize bunyan loggers
 */

var bunyan = require('bunyan')
var plugins = require('restify-plugins')
var restify = require('restify')

var initLogger = function(server) {

  var logger = bunyan.createLogger({
    name: 'yelpick',
    stream: process.stdout
  })

  // Handle and log uncaught exceptions
  server.on('uncaughtException', function (req, res, route, err) {
    logger.fatal(err)
  })

  // Handle and log internal errors
  server.on('InternalServer', function (req, res, err, next) {
    logger.fatal(err)
    return next()
  })

  // Per request logger
  server.on('after', plugins.auditLogger({
    log: logger
  }))

  // Expose logger
  server.log = logger

}

module.exports = initLogger