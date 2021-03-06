var importDb = function(util, firebase, scores) {

  var LOG_REF = '/log';

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
      reportGameStatus(username + " JOINED");
    };
    ref.on('child_added', update);
    ref.on('child_changed', update);
  }

  function runLogFromBeginning(state, onLogUpdate) {
    console.log("Running log from the start");
    var ref = database.ref(LOG_REF);
    return ref.on('child_added', function(data) {
      var msg = data.val();
      var key = data.key;
      readLog(state, msg, key);
      onLogUpdate(state, msg);
    });
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
   *
   *
   */
  function initLog(state, initializeGame, onLogUpdate, startLogFromBeginning) {
    if(startLogFromBeginning) {
      initializeGame(state);
      return runLogFromBeginning(state, onLogUpdate);
    } else {
      database
        .ref('/state')
        .orderByKey()
        .limitToLast(1)
        .once('child_added', function(snapshot) {
          var stateSnapshot = snapshot.val();
          var key = snapshot.key;
          console.log("Starting log from: " + key);
          stateSnapshot.nodes.forEach(function(n) {
            util.addNode(n.id, state, n.score, n.clicks, n.lastClickTime, n.lastClickGainedAt);
          });
          stateSnapshot.edges.forEach(function(e) {
            util.addEdge(e.source.id, e.target.id, state)
          });
          state.randomIndex = stateSnapshot.randomIndex;
          state.players = stateSnapshot.players;
          state.logEntry = key;
          initializeGame(state);
          var ref = database.ref(LOG_REF).orderByKey().startAt(key);
          return ref.on('child_added', function(data) {
            var msg = data.val();
            var key = data.key;
            readLog(state, msg, key);
            onLogUpdate(state, msg);
          });
        }, function(error) {
          console.log("ERROR fetching state, starting from scratch", error);
          initializeGame(state);
          runLogFromBeginning(state, onLogUpdate);
        });
    }
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
    database.ref(LOG_REF).set({});
    database.ref('/state').set({});
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
  }

  function trackClick(state, msg) {
    var node = state.seenNodes[msg.sender];
    if(node) {
      node.clicks = util.clicks(node.clicks - 1);
      node.lastClickTime = msg.timestamp;
    } else {
      console.log("CAN'T ADD CLICK TO NODE WE AIN'T SEEN: " + msg.sender);
    }
  }

  /**
   * Handle a single log message (msg).
   *
   * This method handles updating our local graph based on information
   * we receive from Firebase.
   */
  function readLog(state, msg, key) {
    if (!msg.timestamp) {
      msg.timestamp = COMMON_EPOCH;
    }
    if (msg.type === "invite") {
      if (msg.sender == null) {
        // basically adding omarieclaire
        util.addNode(msg.recipient, state);
      } else {
        util.addEdge(msg.sender, msg.recipient, state);
        var senderNode = state.seenNodes[msg.sender];
        var recipientNode = state.seenNodes[msg.recipient];
        senderNode.score += INVITE_INCREMENT_SENDER_SCORE;
        recipientNode.score += INVITE_INCREMENT_RECEIVER_SCORE;
      }
      trackClick(state, msg);
    } else if (msg.type === "newConnection") {
      util.addEdge(msg.sender, msg.recipient, state);
      trackClick(state, msg);
    } else if (msg.type === "giveStrength") {
      var eid = util.edgeId(msg.sender, msg.recipient);
      var edge = state.seenEdges[eid];
      var sender = state.seenNodes[msg.sender];
      var recipient = state.seenNodes[msg.recipient];
      if (!edge) {
        console.log("%o is not connected to %o", sender.id, recipient.id);
      } else {
        sender.score = util.health(sender.score + CLICK_INCREMENT_SENDER_SCORE);
        recipient.score = util.health(recipient.score + CLICK_INCREMENT_RECEIVER_SCORE);
        trackClick(state, msg);
        scores.calculateCommonScore(state);
      }
    } else if (msg.type === "destroyEdge") {
      var eid = util.edgeId(msg.source.id, msg.target.id);
      var edge = state.seenEdges[eid];
      if (edge) {
        util.deleteEdge(edge, state);
      }
    } else if (msg.type === "weakenCommon") {
      _.each(state.nodes, function (node) {
        var p = node.score;
        node.score = util.health(node.score - msg.power);
        if(node.score <= 0) {
          util.killPlayer(node, state);
        }
      });
      scores.calculateCommonScore(state);
    } else if (msg.type === "gainClicks") {

      var node = state.seenNodes[state.selfId];
      if (msg.id === state.selfId && node && node.score > 0) {
        // the logged-in player will gain clicks
        node.clicks = Math.min(MAX_CLICKS, node.clicks + msg.numClicks);
        node.lastClickGainedAt = msg.lastClickGainedAt;
      } else {
        // do nothing, it's a different player
      }
    } else if (msg.type === "reinforceConnection") {
      // deprecated
    } else if (msg.type === "weakenNode") {
      // deprecated
    } else if (msg.type === "weakenEdge") {
      // deprecated
    } else {
      console.log("unknown msg type %o: %o", msg.type, msg);
    }

    if (msg.type === "invite") {
      reportGameStatus((msg.sender || "UNKNOWN") + " INVITED " + msg.recipient);
    } else if (msg.type === "newConnection") {
      reportGameStatus("CONNECTED: " + msg.sender + " + " + msg.recipient);
    } else if (msg.type === "giveStrength") {
      reportGameStatus(msg.sender + " gave strength to " + msg.recipient);
    } else if (msg.type === "destroyEdge") {
      reportGameStatus("EDGE DESTROYED");
    } else if (msg.type === "weakenCommon") {
      reportGameStatus("COMMON WEAKENED w POWER " + msg.power);
    } else if (msg.type === "gainClicks") {
      if (msg.id === state.selfId && state.seenNodes[state.selfId] && state.seenNodes[state.selfId].score > 0) {
        // reportGameStatus("YOU GAINED CLICKS");
      }
    }

    state.logEntry = key;
  }

  /**
   * Send a log message to be appended to /log.
   *
   * This is a helper method that should be used by all our other
   * "send" methods.
   */
  function sendLog(msg) {
    msg.timestamp = firebase.database.ServerValue.TIMESTAMP;
    return database.ref(LOG_REF).push().set(msg);
  }

  /**
   * Snapshots the state at a given log entry
   */
  function snapshotState(state) {
    return database.ref('/state/' + state.logEntry).set({
      randomIndex: state.randomIndex,
      players: state.players,
      nodes: state.nodes,
      edges: state.edges
    });
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
    });
  }

  /**
   * Create a new graph conneection between existing players.
   *
   * This method requires both players to already exist.
   */
  function newConnection(sender, recipient) {
    sendLog({
      type: "newConnection",
      sender: sender,
      recipient: recipient
    });
  }

  /**
   * giveStrength to two players
   *
   * This method requires both players to already exist, and to have
   * an existing edge between them already.
   */
  function giveStrength(sender, recipient) {
    sendLog({
      type: "giveStrength",
      sender: sender,
      recipient: recipient
    });
  }

  function destroyEdge(source, target) {
    sendLog({
      type: "destroyEdge",
      source: source,
      target: target
    });
  }

  function weakenCommon(power) {
    sendLog({
      type: "weakenCommon",
      power: power
    });
  }

  function gainClicks(id, numClicks, lastClickGainedAt) {
    sendLog({
      type: "gainClicks",
      id: id,
      numClicks: numClicks,
      lastClickGainedAt: lastClickGainedAt
    });
  }

  // check if player at username exists
  function userExists(username) {
    var promise =
      database
        .ref('/players/' + username)
        .once('value').then(function(snapshot) {
          return snapshot.exists();
        });

    return promise;
  }

  return {
    initPlayers: initPlayers,
    initLog: initLog,
    sendLog: sendLog,
    sendInvite: sendInvite,
    newConnection: newConnection,
    giveStrength: giveStrength,
    destroyEdge: destroyEdge,
    weakenCommon: weakenCommon,
    reinitialize: reinitialize,
    createPlayer: createPlayer,
    snapshotState: snapshotState,
    gainClicks: gainClicks,
    userExists: userExists,
    trackClick: trackClick
  };
};
