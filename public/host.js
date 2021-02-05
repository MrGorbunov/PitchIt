/*
host.js
===============

host.html houses the entirety of the host's view of the game.

The different host-views are created with by toggling the differnet displays
w/ Vue. That means this code contains all of the socket & logical control 
for the flow of the game.

The game itself is broken into the following stages:


1 - Lobby
Everyone else joins via the code thats displayed, and when ready the host
hits 'start game'.


2 - Problem Synthesis
The players are all given 1 prompt and 30 seconds to describe their problem. The
host screen displays progress bars for each player.


3 - Solution Creation
The players are given 2 problems and 2 minute to generate solutions. The host again
displays progress bar for each player. 


4 - Presentation
Now the host's screen becomes the center of attention. For every problem generated,
the host needs to display solutions and then allow for people to vote. First the
problem-haver has 10 seconds to explain their problem. Then the first inventor goes
for 20 seconds, and then the second inventor for 15 seconds, displaying their solutions
to the world. 


5 - Voting
Then, there is a 30 second voting period that doubles as a QnA session. In this game,
votes count are themed as investment money. When it comes to voting, most votes are worth 
$1000. The original problem-haver's vote is worth $2500, and if the vote is unanimous then
that inventor gains an extra $1500.

(Go back to step 4 until all problems have been voted on)


6 - Leaderboard
This just displays the leaderboard, with everyone and their money amounts in order.


All of that is done on this one page, so lmao this is smart.
*/






//
// Front End Logic (Vue, gizmos, etc)
//

const STATES = {
  LOBBY: 0,
  PROBLEMS: 1,
  SOLUTIONS: 2,
  PRESENTATION: 3,
  VOTE: 4,
  LEADERBOARD: 5
}

var hostApp = new Vue ({
  el: '#host-app',
  data: {
    // Lobby Data
    code: '-----',
    players: [],

    // Gameplay Data
    state: STATES.LOBBY,
    /* TODO: Code this */
  }
});









//
// Web Socket woohoo bby
//

const socket = io('localhost:5000');
initConnection();

function initConnection() {
  socket.emit('identify-role', 'HOST', (succesful) => {
    if (!succesful) {
      // Lmao cuh
      alert('Big bad. Role ID failed, apparently "HOST" isn\'t valid??');
      return;
    }

    socket.emit('lobby-create'); 
  });
}

socket.on('lobby-gamecode', gameCode => {
  hostApp.code = gameCode;
});

socket.on('lobby-clientlists', (nameLists) => {
  hostApp.players = nameLists.players;
});




