var socketio = require('socket.io')
var shortid = require('shortid')
var Game = require('../models/game.js')

var UpdateGameStateEvent = 'updateGameState'
var GameEndEvent = 'gameEnd'
var ErrorEvent = 'errorState'

var initSockets = function(server) {

    var io = socketio.listen(server.server)

    io.sockets.on('connection', function (socket) {
      console.log('%s connected!', socket.id)


      socket.on('create', function (msg) {
        console.log('create')
        var newGame = new Game({
          roomId: shortid.generate(),
          state: 'waiting',
          players: [{
            userId: msg.userId,
            businessId: msg.businessId,
            state: 'alive',
            score: 0,
            socketId: socket.id
          }],
          sockets: []
        })

        newGame.save()
        .then(function(createdGame) {
          console.log('host %s created room %s', msg.userId, createdGame.roomId)
          socket.join(createdGame.roomId, function() {
            console.log('host %s joined room %s', msg.userId, createdGame.roomId)
            console.log(createdGame)
            io.sockets.in(createdGame.roomId).emit(UpdateGameStateEvent, createdGame)
          })
        })
        .catch(function(error) {
          console.log(error)
          socket.emit(ErrorEvent, { error: error })
        })
      })


      socket.on('join', function(msg) {
        console.log('join')
        Game.findOne({roomId: msg.roomId}).exec()
        .then(function(gameRoom) {
          if (!gameRoom) {
            throw Error('Room not found')
          }

          gameRoom.players.push({
            userId: msg.userId,
            businessId: msg.businessId,
            state: 'alive',
            score: 0,
            socketId: socket.id
          })

          return gameRoom.save()
        })
        .then(function(updatedGame) {
          console.log('user %s added to game %s', msg.userId, updatedGame.roomId)
          socket.join(updatedGame.roomId, function() {
            console.log('host %s joined socket room %s', msg.userId, updatedGame.roomId)
            io.sockets.in(updatedGame.roomId).emit(UpdateGameStateEvent, updatedGame)
          })
        })
        .catch(function(error) {
          console.log(error)
          socket.emit(ErrorEvent, { error: error })
        })
      })


      socket.on('start', function (msg) {
        console.log('start')
        var roomId = getGameRoom(socket.rooms, socket.id)
        Game.findOne({roomId: roomId}).exec()
        .then(function(gameRoom) {
          gameRoom.state = 'playing'
          return gameRoom.save()
        }).then(function(updatedGame) {
          io.sockets.in(updatedGame.roomId).emit(UpdateGameStateEvent, updatedGame)
        })
        .catch(function(error) {
          console.log(error)
          socket.emit(ErrorEvent, { error: error })
        })
      })


      socket.on('score', function(msg) {
        console.log('score')
        var roomId = getGameRoom(socket.rooms, socket.id)
        Game.findOne({roomId: roomId}).exec()
        .then(function(gameRoom) {
          for (var i=0; i<gameRoom.players.length; i++) {
            if (gameRoom.players[i].userId == msg.userId) {
              gameRoom.players[i].score = msg.score
              console.log('user %s score is %s', msg.userId, msg.score)
              break
            }
          }
          return gameRoom.save()
        })
        .then(function(updatedGame) {
          io.sockets.in(updatedGame.roomId).emit(UpdateGameStateEvent, updatedGame)
        })
        .catch(function(error) {
          console.log(error)
          socket.emit(ErrorEvent, { error: error })
        })
      })


      socket.on('died', function(msg){
        console.log('died')
        var roomId = getGameRoom(socket.rooms, socket.id)
        Game.findOne({roomId: roomId}).exec()
        .then(function(gameRoom) {
          for (var i=0; i<gameRoom.players.length; i++) {
            if (gameRoom.players[i].userId == msg.userId) {
              gameRoom.players[i].state = 'dead'
            }
          }

          if (hasGameEnd(gameRoom)) {
            gameRoom.state = 'end'
          }

          return gameRoom.save()
        })
        .then(function(updatedGame) {
          if (updatedGame.state === 'end') {
            console.log('game over')
            var winnerId = ''
            var winnerBizId = ''
            var maxScore = -1
            for (var i=0; i<updatedGame.players.length; i++) {
              if (maxScore < updatedGame.players[i].score) {
                maxScore = updatedGame.players[i].score
                winnerId = updatedGame.players[i].userId
                winnerBizId = updatedGame.players[i].businessId
              }
            }
            console.log('winner: %s, winner biz: %s', winnerId, winnerBizId)

            io.sockets.in(updatedGame.roomId).emit(GameEndEvent, {
              userId: winnerId,
              businessId: winnerBizId
            })
          }
          else {
            io.sockets.in(updatedGame.roomId).emit(UpdateGameStateEvent, updatedGame)
          }
        })
        .catch(function(error) {
          console.log(error)
          socket.emit(ErrorEvent, { error: error })
        })
      })


      socket.on('disconnecting', function() {
        console.log('disconnecting')
        var roomId = getGameRoom(socket.rooms, socket.id)
        Game.findOne({roomId: roomId}).exec()
        .then(function(gameRoom) {
          // TODO: we should declare players as dict for faster search
          for (var i=0; i<gameRoom.players.length; i++) {
            if (gameRoom.players[i].socketId == socket.id) {
              gameRoom.players[i].state = 'dead'
              console.log('user %s disconnected', gameRoom.players[i].userId)
              break
            }
          }

          if (hasGameEnd(gameRoom)) {
            gameRoom.state = 'end'
          }

          return gameRoom.save()
        })
        .then(function(updatedGame) {
          if (updatedGame.state === 'end') {
            console.log('game over')
            var winnerId = ''
            var winnerBizId = ''
            var maxScore = -1
            for (var i=0; i<updatedGame.players.length; i++) {
              if (maxScore < updatedGame.players[i].score) {
                maxScore = updatedGame.players[i].score
                winnerId = updatedGame.players[i].userId
                winnerBizId = updatedGame.players[i].businessId
              }
            }
            console.log('winner: %s, winner biz: %s', winnerId, winnerBizId)

            io.sockets.in(updatedGame.roomId).emit(GameEndEvent, {
              userId: winnerId,
              businessId: winnerBizId
            })
          }
          else {
            io.sockets.in(updatedGame.roomId).emit(UpdateGameStateEvent, updatedGame)
          }
        })
        .catch(function(error) {
          console.log(error)
          socket.emit(ErrorEvent, { error: error })
        })
      })


      function getGameRoom(rooms, socketId) {
        for (var roomId in rooms) {
          if (rooms.hasOwnProperty(roomId) && roomId !== socketId) {
            return roomId
          }
        }
      }


      function hasGameEnd(gameRoom) {
        var deadCount = 0
        for (var i=0; i<gameRoom.players.length; i++) {
          if (gameRoom.players[i].state == 'dead') {
            deadCount += 1
          }
        }
        return deadCount === gameRoom.players.length - 1
      }
    })
}

module.exports = initSockets
