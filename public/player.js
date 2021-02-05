/*
player.js

The control flow for the player is listed below. Note a <- means
this client sends the info and -> is recieving from the server.

1 - Socket connection established and presents self as player (identify-role). The user is presented a form to enter a gamecode and name.
 <- identify-role ('PLAYER')

2 - User fills out form an connects to the lobby
 <- lobby-join (gameCode, name)
 -> confirmation-lobby-join (result, reason)

3 - Game begins, and intermediary screen is displayed
 -> game-begin

4 - continue

*/


//
// Front End Logic (Vue, gizmos, etc)
//

const STATES = {
  FORM: 'FORM',       // After socket connection but before in a lobby
  LOBBY: 'LOBBY',
  INTERMISSION: 'INTERMISSION'
}

var playerApp = new Vue({
  el: '#player-app',
  data: {
    state: STATES.FORM,
    name: ''
  }
});









//
// Web Socket woohoo bby
//

const socket = io('localhost:5000');
initConnection();

function initConnection () {
  socket.emit('identify-role', 'PLAYER', (succesful) => {
    if (!succesful) {
      console.error("Cuh. 'PLAYER' didn't get recognized as a valid role???") ;
      alert('Boi something jst screwed up sorry :(');
      return;
    }

    playerApp.state = STATES.FORM;
  });
}



//
// Joining a Lobby 
document.getElementById('form-joinGame').addEventListener('click', attemptToJoinLobby);

function attemptToJoinLobby () {
  const gameCode = document.getElementById('form-gameCode').value.toUpperCase().substring(0, 5);
  const playerName = document.getElementById('form-name').value;
  
  socket.emit('lobby-join', gameCode, playerName, (success, message) => {
    if (!success) {
      alert(message);
      return;
    }

    playerApp.state = STATES.LOBBY;
  });
}
