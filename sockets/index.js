var Game = require('../models/game.js')

var socketio = require('socket.io')

var shortid = require('shortid');

var initSockets = function(server) {

    //TODO: I create a global game_room for testing
    var room_map = {};

    var io = socketio.listen(server.server);

    // Define socket events here
    io.sockets.on('connection', function (socket) {
        console.log('connected!');
        socket.emit('new_connection', { hello: 'Welcome to YelPick!' });

        socket.on('create', function (msg) {
          var new_game = new Game({shortId: shortid.generate(), state: 'waiting', players: [], sockets: []});
          new_game.players.push({user_id: msg.user_id, business_id: msg.business_id, room_id: new_game.shortId, state: 'alive', score: 0, socket_id: socket.id});
          new_game.sockets.push(socket.id);
          new_game.save();
          socket.join(new_game.shortId, function() {
            console.log('host %s created room %s', msg.user_id, new_game.shortId);
            socket.emit('create_result', {user_id: msg.user_id, room_id: new_game.shortId});
          })
        })

        socket.on('join', function (msg) {
          socket.join(msg.room_id, function() {
            Game.findOne({shortId: msg.room_id}).exec()
            .then(function (game_room) {
              game_room.players.push({user_id: msg.user_id, business_id: msg.business_id, room_id: game_room.shortId, state: 'alive', score: 0, socket_id: socket.id});
              game_room.sockets.push(socket.id);
              console.log('user %s joined room with biz_id %s', msg.user_id, msg.business_id);
              socket.emit('join_result', {players: game_room.players.length});
              io.sockets.in(msg.room_id).emit('info', msg.user_id +' has joined the game!');
              console.log(game_room.sockets);
              game_room.save();
            })
          })
        })

        // only host can start the game
        socket.on('start', function (msg) {
          console.log('host ready to start game');
          io.sockets.in(msg.room_id).emit('game start');
        })

        socket.on('score', function(msg) {
          Game.findOne({shortId: msg.room_id}).exec()
          .then(function(game_room) {
            for (var i=0; i<game_room.players.length; i++) {
              if (game_room.players[i].id == msg.user_id) {
                game_room[i].score = msg.score;
                console.log('user %s score is %s', user_id, score);
                break;
              }
            }
            game_room.save();
          })
        })

        function has_game_end(game_room) {
          var dead_cnt = 0;
          for (var i=0; i<game_room.players.length; i++) {
            if (game_room.players[i].state == 'dead') {
              dead_cnt += 1;
            }
          }
          return dead_cnt == game_room.players.length;
        }

        function broadcast_result(game_room) {
          max_score = 0;
          winner = null;
          for (var i=0; i<game_room.players.length; i++) {
            if (max_score < game_room.players[i].score) {
              max_score = game_room.players[i].score;
              winner = game_room.players[i];
            }
          }
          console.log('winner is %s, decisioin is %s', winner, winner.business_id);
          io.sockets.in(game_room.shortId).emit('result', {winner: winner.user_id, decision: winner.business_id})
        }

        function mark_user_dead(game_room, user_id) {
          for (var i=0; i<game_room.players.length; i++) {
            if (game_room.players[i].id == user_id) {
              game_room[i].state = 'dead';
            }
          }
          game_room.save()
        }

        socket.on('died', function(msg){
          Game.findOne({shortId: msg.room_id}).exec()
          .then(function(game_room) {
            mark_user_dead(game_room, msg.user_id);
            socket.emit('died_result', 'you have died');
            if (has_game_end(game_room)) {
              broadcast_result(socket, game_room)
            }
          })
        })

        // so when a client is killed, we only have socket id
        // thus we need socket id to find the game_room
        socket.on('disconnect', function() {
          console.log('socket %s tries to disconnect', socket.id);
          Game.findOne({sockets: socket.id}).exec()
          .then(function(game_room) {
            // TODO: we should declare players as dict for faster search
            console.log(game_room.sockets);
            disconnected_user_id = '';
            for (var i=0; i<game_room.players.length; i++) {
              if (game_room.players[i].socket_id == socket.id) {
                disconnected_user_id = game_room.players[i].user_id;
                break;
              }
            }
            game_room.update({$pull: {players: disconnected_user_id}});
            game_room.update({$pull: {sockets: socket.id}});
            game_room.save()

            mark_user_dead(game_room, disconnected_user_id);
            if (has_game_end(game_room)) {
              broadcast_result(game_room)
            }
            console.log('user %s disconnected, socket is %s', disconnected_user_id, socket.id);
            console.log('connected sockets %s', game_room.sockets);
          })
        })
    })
}

module.exports = initSockets
