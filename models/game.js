var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Player = new Schema({
  user_id: String,
  business_id: String,
  room_id: String,
  state: {
    type: String,
    enum: ['alive', 'dead']
  },
  score: Number,
});

var Game = new Schema({
  shortId: String,
  state: {
    type: String,
    enum: ['waiting', 'playing', 'end']
  },
  players: [Player],
}, { collection: 'games' });

module.exports = mongoose.model('Game', Game);
