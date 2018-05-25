var importDb = function(scores, ui, util, firebase) {

  var database = firebase.database();

  /**
   * Do an initial read of /players/* and set up a listener to notice
   * any updates that happen. Any time /players/* changes we'll
   * receive an event and our update function will be called.
   *
   * See https://firebase.google.com/docs/database/web/lists-of-data
   *
   * NOTE: We don't normally expect to get child_removed or
   * child_moved events, so we don't handle them here.
   *
   * See reinitialize for more about how we handle the situation where
   * we want to delete players.
   */
  function initPlayers(state) {
    var ref = database.ref('/players');
    var update = function (data) {
      var username = data.key;
      state.players[username] = data.val();
    };
    ref.on('child_added', update);
    ref.on('child_changed', update);
  }

  /**
   * Do an initial read of /log/* and set up a listener to notice any
   * updates that happen. Any time /log/* changes we'll receive an
   * event and readLog will be called.
   *
   * See https://firebase.google.com/docs/database/web/lists-of-data
   *
   * NOTE: We don't normally expect to get child_changed,
   * child_removed, or child_moved events, so we don't handle them
   * here. The log is normally append-only (we just add new log
   * messages when things change).
   *
   * See reinitialize for more about how we handle the situation where
   * we want to delete the logs.
   */
  function initLog(state) {
    var ref = database.ref('/log');
    ref.on('child_added', function (data) {
      var msg = data.val();
      readLog(state, msg);
    });
  }

  /**
   * Return the database to an initial state, removing all other data.
   *
   * This method is intended to be used to restore the DB to a
   * known-good state, for example after adding broken data, or after
   * changing the DB schema in an incompatible way.
   *
   * We first delete all the local state which will be outdated
   * (player and graph information). Then we set /players and /log to
   * be empty objects, and then use the sendInvite function to
   * populate them with 3 starting users.
   */
  function reinitialize(state) {
    state.seenNodes = {}
    state.seenEdges = {}
    state.nodes = []
    state.edges = []
    database.ref('/players').set({});
    database.ref('/log').set({});
    sendInvite(null, "omarieclaire", "marieflanagan@gmail.com");
    sendInvite("omarieclaire", "vilevin", "aaronmichaelbenjaminlevin@gmail.com");
    sendInvite("vilevin", "erik", "stark.fist@gmail.com");
  }

  /**
   * Add a username to a logged-in user
   */
  function setUsername(username, authenticatedUser) {

    database.ref('/players/' + username).once("value").then(function(snapshot) {
      var player = snapshot.val();
      // this username exists, do nothing.
      if(player) {
        console.log("attempted to set username " + username + ", it already exists");
      } else {
        database.ref('/players/' + username).set({
          email: authenticatedUser.email,
          username: username,
          lastSeen: 0
        });
        sendLog({
          type: "set-username",
          email: authenticatedUser.email,
          username: username,
        });
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  }

  /**
   * Handle a single log message (msg).
   *
   * This method handles updating our local graph based on information
   * we receive from Firebase.
   */
  function readLog(state, msg) {
    if (msg.type === "invite") {
      if (msg.sender == null) {
        util.addNode(msg.recipient, state);
      } else {
        util.addEdge(msg.sender, msg.recipient, 3, state);
      }
    } else if (msg.type === "newConnection") {
      util.addEdge(msg.sender, msg.recipient, 3, state);
    } else if (msg.type === "giveStrength") {
      var eid = util.edgeId(msg.source, msg.target);
      var edge = state.seenEdges[eid];
      var node = state.seenNodes[msg.id];
      if (!edge) {
        console.log("%o gave strength to missing edge: %o", msg.id, msg);
      } else if (node.score <= msg.amount) {
        console.log("%o (%o) was too weak to give strength: %o", msg.id, node, msg);
      } else {
        node.score -= msg.amount;
        edge.strength += msg.amount;
      }
    } else if (msg.type === "weakenEdge") {
      var eid = util.edgeId(msg.source, msg.target);
      var edge = state.seenEdges[eid];
      if (edge) {
        if (edge.strength <= msg.power) {
          util.deleteEdge(edge, state);
        } else {
          edge.strength -= msg.power;
        }
      }
    } else if (msg.type === "weakenNode") {
      var node = state.seenNodes[msg.id];
      if (node.score <= msg.power) {
        util.deleteNode(node, state);
      } else {
        node.score -= msg.power;
      }
    } else {
      console.log("unknown msg type %o: %o", msg.type, msg);
    }
    if (state.loaded) state.draw();
  }

  /**
   * Send a log message to be appended to /log.
   *
   * This is a helper method that should be used by all our other
   * "send" methods.
   */
  function sendLog(msg) {
    database.ref('/log').push().set(msg);
  }

  /**
   * Send an invite to a player.
   *
   * In addition to sending a log message, this method must also add
   * the new player to our existing /players DB.
   */
  function sendInvite(sender, recipient, email) {
    database.ref('/players/' + recipient).set({
      email: email,
      lastSeen: 0
    });
    sendLog({
      type: "invite",
      email: email,
      sender: sender,
      recipient: recipient,
      startingLife: STARTING_LIFE
    });
  }

  /**
   * Create a new graph conneection between existing players.
   *
   * This method requires both players to already exist.
   */
  function newConnection(sender, recipient, amount) {
    sendLog({
      type: "newConnection",
      sender: sender,
      recipient: recipient,
      amount: amount
    });
  }

  /**
   * Create a new graph conneection between existing players.
   *
   * This method requires both players to already exist, and to have
   * an existing edge between them already.
   */
  function giveStrength(sender, recipient, amount) {
    sendLog({
      type: "giveStrength",
      sender: sender,
      recipient: recipient,
      amount: amount
    });
  }

  function weakenEdge(source, target, power) {
    sendLog({
      type: "weakenEdge",
      source: source,
      target: target,
      power: power
    });
  }

  function weakenNode(id, power) {
    sendLog({
      type: "weakenNode",
      id: id,
      power: power
    });
  }

  return {
    initPlayers: initPlayers,
    initLog: initLog,
    sendInvite: sendInvite,
    newConnection: newConnection,
    giveStrength: giveStrength,
    weakenEdge: weakenEdge,
    weakenNode: weakenNode,
    reinitialize: reinitialize,
    setUsername: setUsername
  };
};
