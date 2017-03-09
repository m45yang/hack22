'use strict'

/**
 * Initialize connection to mongodb with Mongoose
 */

var mongoose = require('mongoose')
var Promise = require('bluebird')

var initMongoose = function(server) {

  // Use bluebird as Mongoose promise library
  mongoose.Promise = Promise

  // Initialize connection to database
  mongoose.connect(server.config.db[process.env.NODE_ENV || 'development'])
  var db = mongoose.connection

  db.on('error', function () {
    server.log.error('database connection error')
  })

  db.once('open', function dbOpen() {
    server.log.info('database connection established')
  })

}

module.exports = initMongoose