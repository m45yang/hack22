var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Player = new Schema({
  userId: String,
  businessId: String,
  socketId: String,
  state: {
    type: String,
    enum: ['alive', 'dead']
  },
  score: Number,
});

var Game = new Schema({
  roomId: String,
  state: {
    type: String,
    enum: ['waiting', 'playing', 'end']
  },
  players: [Player],
}, { collection: 'games' });

module.exports = mongoose.model('Game', Game);
