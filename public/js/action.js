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

		var target = d.id;
		//reference to the edge between me and the target
		var ouredge = state.edges.filter(function (edge) {
			return edge.source.id == state.selfId && edge.target.id == target ||
				edge.target.id == state.selfId && edge.source.id == target;
		})[0];

		// if clicking on a edge attached to our nodes
		var ourNode = state.seenNodes[state.selfId];
		var htmlNode = document.getElementById(util.nodeIdAttr(d));

		if (state.playerClicks <= 0) {
			playSound("poor-sound", 0.2);
			var clickHtmlText = document.getElementById("player-clicks-text");
			var clickHtml = document.getElementById("player-clicks");
			d3.select(clickHtmlText).transition().duration(500).style("color", "red").transition().duration(2000).style("color", null);
			d3.select(clickHtml).transition().duration(1000).style("color", "red").transition().duration(1500).style("color", null);

			console.log("action.nodeClicked: no clicks available!");
			return;
		}

		if (ouredge && ourNode) {
			db.giveStrength(ourNode.id, target);
			playSound("reinforcing-connection-sound", 0.2);
			// begin edge animation
			var htmlEdge = document.getElementById(util.edgeIdAttr(ouredge));
			d3.select(htmlEdge).transition().duration(1000).attr("stroke", "#00FF00").transition().duration(1500).attr("stroke", null);

			// begin node animation
			d3.select(htmlNode).transition().duration(1000).style("fill","#00FF00").transition().duration(1500).style("fill", d.color);
		} else {
			playSound("error-sound", 0.5);
			d3.select(htmlNode).transition().duration(1000).style("fill","gray").transition().duration(1500).style("fill", d.color);
		}

		scores.calculateCommonScore(state);
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

	function tryDestroyer(state) {
		if (!state.seenNodes[state.selfId]) {
			console.log("user is anonymous -- can't run destroyer");
			return;
		}
		// destroyer has a 1-in-60 chance of running every minute.
		// this means for each player, we expect the destroyer to run
		// about once for every hour they play.
		if (_.random(1, 60) == 1) {
			runDestroyer(state);
		}
	}

	function runDestroyer(state) {
		var rate = ui.getDecayRate(state);
		console.log("running the destroyer (decay rate: %o)", rate);
		if (rate > 0) {
			// if rate is 0, the common doesn't get weaker
			db.weakenCommon(rate);
		}
		if (_.random(1, 10) == 10) {
			// 10% chance of destroying a random connection
			var i = _.random(0, state.edges.length - 1);
			var edge = state.edges[i];
			if (edge) {
				console.log("destroying a random edge: %o", edge);
				db.destroyEdge(edge.source, edge.target);
			}
		}
	}

  function runSnapshotter(state) {
    db.snapshotState(state);
  }

	function reinitializeClicked(state) {
		db.reinitialize(state);
	}

  function tryToGainClicks(state) {
		if (!state.seenNodes[state.selfId]) {
			console.log("user is anonymous -- can't gain clicks");
			return;
		}

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
		tryDestroyer: tryDestroyer,
		tryToGainClicks: tryToGainClicks,
    runSnapshotter: runSnapshotter
	};
};
