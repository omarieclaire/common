// The things that the users do in the app. Click events should go here.

var importAction = function(ui, util, scores, db) {

	function addEdge(from, to, state) {

		if (state.playerClicks <= 0) {
			console.log("action.addEdge: no clicks available!");
			return;
		}

		if (state.players[from] == null) {
			db.sendInvite("omarieclaire", from, from+"@fake.com");
		}

		if (state.players[to] == null) {
			db.sendInvite(from, to, to+"@fake.com");
			return;
		}

		var eid = util.edgeId(from, to);
		if (!state.seenEdges[eid]) {
			db.newConnection(from, to);
		} else {
			db.giveStrength(from, to);
		}
	}

	function nodeClicked(state, d) {

		if (state.playerClicks <= 0) {
			console.log("action.nodeClicked: no clicks available!");
			return;
		}

		var target = d.id;
		//reference to the edge between me and the target
		var ouredge = state.edges.filter(function (edge) {
			return edge.source.id == state.selfId && edge.target.id == target ||
				edge.target.id == state.selfId && edge.source.id == target;
		})[0];

		// if clicking on a edge attached to our nodes
		// decrement our score
		var ourNode = state.seenNodes[state.selfId];
		if (ouredge && ourNode) {
			db.giveStrength(ourNode.id, target);
			playSound("reinforcing-connection-sound", 0.2);
			// begin edge animation
			var htmlEdge = document.getElementById(util.edgeIdAttr(ouredge));
			d3.select(htmlEdge).transition().duration(1000).attr("stroke", "#00FF00").transition().duration(1500).attr("stroke", null);

			// begin node animation
			var htmlNode = document.getElementById(util.nodeIdAttr(d));
			// d3.select(htmlNode).transition().duration(10).style("fill","magenta").transition().duration(1500).style("fill", d.color);
		}

		scores.calculateCommonScore(state.edges, state.nodes, state.selfId);
		state.draw();
	}

	function addClicked(state) {
		if (state.playerClicks <= 0) {
			console.log("action.addClicked: no clicks available!");
			return;
		}
		// get the text from the 'from' form
		var from = document.getElementById("from").value;
		// get the text from the to' form
		var to = document.getElementById("to").value;
		addEdge(from, to, state);
	}

	function randomClicked(state) {
		// create a random name for a new node
		// find an existing node to connect it
		// connect the nodes
		var to;
		if (_.random(1) === 0) {
			// create a new node
			to = "rr" + state.randomIndex;
			state.randomIndex += 1;
		} else {
			to = _.sample(state.seenNodes).id;
		}
		var from = _.sample(state.seenNodes).id;
		addEdge(from, to, state);
	}

  function runDestroyer(state) {
		if (_.random(1, 10) == 10) {
		  // 10% chance of destroying a connection
		  var i = _.random(0, state.edges.length - 1);
		  var edge = state.edges[i];
		  if (edge) {
			db.destroyEdge(edge.source, edge.target);
		  }
		}

	    db.weakenCommon(DESTROYER_POWER);
		var j = _.random(0, state.nodes.length -1);
		var node = state.nodes[j];
		if (node) {
			db.weakenNode(node.id, DESTROYER_POWER);
		}
	}

	function reinitializeClicked(state) {
		db.reinitialize(state);
	}

  function tryToGainClicks(state) {
	var eightHoursInMillis = 8 * 60 * 60 * 1000;
	var now = util.currentTimeMillis();
	var delta = now - state.lastClickGainedAt;
	var numClicks = Math.floor(delta / eightHoursInMillis);
	var remainder = delta % eightHoursInMillis;
	if (state.playerClicks < 6 && numClicks > 0) {
	  // player gains some clicks
      console.log("gaining clicks %o", numClicks);
	  db.gainClicks(state.selfId, numClicks, now - remainder);
	} else {
		console.log(util.nodesByNetwork(state.nodes));
      console.log("no clicks to gain %o", delta);
	  // nothing happens
	}
  }

	return {
		addEdge: addEdge,
		addClicked: addClicked,
		randomClicked: randomClicked,
		reinitializeClicked: reinitializeClicked,
		nodeClicked: nodeClicked,
		runDestroyer: runDestroyer,
      tryToGainClicks: tryToGainClicks
	};
};
