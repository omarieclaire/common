var importDb = function(util, firebase, scores) {

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
   * Setup a listener to run anytime the log is updated.
   *
   * Action is a function from the log entry
   */
  function listenToLog(action) {
    var ref = database.ref('/log');
    ref.on('child_added', function(data) {
      var msg = data.val();
      action(msg);
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
    var createUser = firebase.functions().httpsCallable("createUserAndInvite");
    state.seenNodes = {}
    state.seenEdges = {}
    state.nodes = []
    state.edges = []
    database.ref('/players').set({});
    database.ref('/log').set({});
    createUser({
      email: "marieflanagan@gmail.com",
      username: "omarieclaire",
      sender: null
    }).then(function(result) {
      return createUser({
        email: "vilevin@gmail.com",
        username: "aaronlevin",
        sender: "omarieclaire"
      });
    }).then(function(result) {
      return createUser({
        email: "stark.fist@gmail.com",
        username: "erik",
        sender: "omarieclaire"
      });
    }).catch(function(error) {
      console.log("Uh oh! Encountered an error while reinitializing");
      console.log(error);
    });
    //sendInvite(null, "omarieclaire", "marieflanagan@gmail.com");
    //sendInvite("omarieclaire", "vilevin", "vilevin@gmail.com");
    //sendInvite("vilevin", "erik", "stark.fist@gmail.com");
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
    } else if(msg.type === "giver") {
      var networkScores = scores.calculateNetworkScoresByNode(state.edges, state.nodes);
      state.nodes.forEach(function(node) {
        var network = networkScores.filter(function(network) {
          return network.people.indexOf(node.id) != -1;
        })[0]
        if(network) {
          node.score = node.score + msg.power * network.health;
        } else {
          console.log("YIKES! Could not find a network for node " + node.id);
        }
      });

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
    return database.ref('/log').push().set(msg);
  }

  /**
   * Create a new player
   */
  function createPlayer(username, email) {
    var promise = database.ref('/players/' + username).set({
      email: email,
      username: username,
      lastSeen: 0
    });
    return promise;
  }

  /**
   * Send an invite to a player.
   *
   * In addition to sending a log message, this method must also add
   * the new player to our existing /players DB.
   */
  function sendInvite(sender, recipient, email) {
    // First check if the recipient already exists
    database
      .ref("/players/" + recipient)
      .once("value")
      .then(function(player) {
        // If the
        if(player.val() === null) {
          console.log("Creating new player: " + recipient);
          createPlayer(recipient, email);
          console.log("Successfuly created new player: " + recipient);
        }
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
   * giveStrength to two players
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

  function runTheGiver(power) {
    return sendLog({
      type: "giver",
      power: power
    });
  }

  return {
    initPlayers: initPlayers,
    initLog: initLog,
    sendLog: sendLog,
    sendInvite: sendInvite,
    newConnection: newConnection,
    giveStrength: giveStrength,
    weakenEdge: weakenEdge,
    weakenNode: weakenNode,
    reinitialize: reinitialize,
    createPlayer: createPlayer,
    listenToLog: listenToLog,
    runTheGiver: runTheGiver
  };
};
