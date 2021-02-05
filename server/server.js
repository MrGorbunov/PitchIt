const path = require('path');
const http = require('http');
const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));

const server = http.createServer(app);
const io = socket(server);
server.listen(PORT, () => {
  console.log(`Now listening on port ${PORT} :D`);
});








//
// Game Logic (both host & players)
//

const SOCKET_ROLE = {HOST: 0, PLAYER: 1};

/*
roomSockets.roomCode = {
  hostID,
  players: [playerIDs],
}
*/
const roomSockets = {}; 
/*
roomClients.roomCode = {
  players: [playerName, ...],
}
*/
const roomGameInfo = {};


io.on('connection', socket => {
  // s => socket variable
  let sRole = undefined;
  let sGameCode = undefined;

  socket.on('identify-role', (role, confirmationFunction) => {
    switch (role) {
      case 'HOST':
        sRole = SOCKET_ROLE.HOST;
        break;
      case 'PLAYER':
        sRole = SOCKET_ROLE.PLAYER;
        break;
      default:
        console.error(`Improper role provided ${role}`);
        confirmationFunction(false);
        return;
    }

    confirmationFunction(true);
  });

  socket.on('disconnect', () => {
    if (!sRole && !sGameCode)
      return;

     
  });










  //
  // Lobby API
  //
  // This includes the host & players' socket calls in order to create,
  // join, etc a lobby.
  //

  socket.on('lobby-create', () => {
    if (sRole !== SOCKET_ROLE.HOST) 
      return;
    
    sGameCode = generateNewGameCode();
    roomSockets[sGameCode] = {
      host: socket.id,
      players: [],
    };
    roomGameInfo[sGameCode] = {
      players: [],
    };
    socket.emit('lobby-gamecode', sGameCode);
    sendGameInfoToHost();
  });


  socket.on('lobby-join', (gameCode, playerName, confirmationFunction) => {
    console.log('New socket attempting to join a game');
    if (sRole !== SOCKET_ROLE.PLAYER) {
      // (success, reason)
      confirmationFunction(false, 'Improper role. (Let the dev know this is an us mistake unless you were purposely playing aroudn with the code)');
      return;
    } else if (playerName.length < 3 || playerName.length > 15) {
      confirmationFunction(false, 'Name must be at least 3 characters but no more than 15');
      return;
    }

    console.log('Izzz a player');
    console.log(roomSockets);
    
    if (!roomSockets[gameCode]) {
      confirmationFunction(false, `No room with code ${gameCode} found`);
      return;
    } else if (roomGameInfo[gameCode].players.includes(playerName)) {
      confirmationFunction(false, `Name ${playerName} already taken`);
      return;
    }

    console.log('And there be no errors');

    sGameCode = gameCode;
    roomSockets[sGameCode].players = roomSockets[sGameCode].players.concat(socket.id);
    roomGameInfo[sGameCode].players = roomGameInfo[sGameCode].players.concat(playerName);
    console.log(roomSockets[sGameCode]);
    sendGameInfoToHost();
    confirmationFunction(true, `Succesfully joined`);
  });


  /**
   * Sends the list of active players to the host. 
   * Useful on new connects, disconnects & reconnects.
   */
  function sendGameInfoToHost () {
    const hostSocketID = roomSockets[sGameCode].host;
    socket.to(hostSocketID).emit('lobby-clientlists', roomGameInfo[sGameCode]);
  }


});




function generateNewGameCode () {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let code = "";
  do {
    code = "";
    for (var i=0; i<5; i++) {
      const randInd = Math.floor(Math.random() * letters.length);
      code += letters[randInd];
    }
  } while (roomSockets.code);  // if a room with this code exists, roomSockets.code does too

  return code;
}
