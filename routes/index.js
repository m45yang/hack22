'use strict'

/**
 * Route definitions for Yelpick
 */

module.exports = function(app) {
  // Index route
  app.get('/', function (req, res) {
    res.send('Hello world, I am Yelpick')
  })
}