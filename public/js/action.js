// The things that the users do in the app. Click events should go here.

var importAction = function(ui, util, scores, db) {

	function nodeClicked(state, d) {

		// if clicking on a edge attached to our nodes
		var ourNode = state.seenNodes[state.selfId];
		var htmlNode = document.getElementById(util.nodeIdAttr(d));

		if (ourNode !== undefined && ourNode.clicks <= 0) {
			playSound("poor-sound", 0.2);
			var clickHtmlText = document.getElementById("player-clicks-text");
			var clickHtml = document.getElementById("player-clicks");
			d3.select(clickHtmlText).transition().duration(500).style("color", "red").transition().duration(2000).style("color", null);
			d3.select(clickHtml).transition().duration(1000).style("color", "red").transition().duration(1500).style("color", null);

			console.log("action.nodeClicked: no clicks available!");
			return;
		}

    var target = d.id;
    //reference to the edge between me and the target
    var ourEdgeId = util.edgeId(state.selfId, target);
    var ouredge = state.seenEdges[ourEdgeId];
    // TODO: ensure ourEdge is available

		if (ouredge && ourNode) {
			db.giveStrength(ourNode.id, target);
			playSound("reinforcing-connection-sound", 0.2);
			// begin edge animation
			var htmlEdge = document.getElementById(util.edgeIdAttr(ouredge));
			d3.select(htmlEdge).transition().duration(1000).attr("stroke", "#00FF00").transition().duration(1500).attr("stroke", null);

			// begin node animation
      htmlNode.classList.add("nodeClickedTransition");
      window.setTimeout(function() {
        htmlNode.classList.remove("nodeClickedTransition");
      }, 1500);
		} else {
			playSound("error-sound", 0.5);
      htmlNode.classList.add("nodeClickedErrorTransition");
      window.setTimeout(function() {
        htmlNode.classList.remove("nodeClickedErrorTransition");
      }, 1500);
		}

		scores.calculateCommonScore(state);
		state.draw();
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
		var myNode = state.seenNodes[state.selfId];
		if(myNode) {
			var rate = ui.getDecayRate(myNode.lastClickTime);
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
		} else {
			console.log("action.runDestroyer not running because user is not logged in");
			// do not run destroyer if user isn't logged in.
		}
	}

  function runSnapshotter(state) {
    db.snapshotState(state);
  }

	function reinitializeClicked(state) {
		db.reinitialize(state);
	}

  function tryToGainClicks(state) {
    var node = state.seenNodes[state.selfId];
		if (!node) {
			console.log("user is anonymous -- can't gain clicks");
			return;
		}

		var eightHoursInMillis = 8 * 60 * 60 * 1000;
		var now = util.currentTimeMillis();
		var delta = now - node.lastClickGainedAt;
		var numClicks = Math.floor(delta / eightHoursInMillis);
		var remainder = delta % eightHoursInMillis;
		if (node.clicks < 6 && numClicks > 0) {
		  // player gains some clicks
	      console.log("gaining clicks %o", numClicks);
		  db.gainClicks(node.id, numClicks, now - remainder);
		} else {
	      console.log("no clicks to gain %o", delta);
		  // nothing happens
		}
  }

	return {
		reinitializeClicked: reinitializeClicked,
		nodeClicked: nodeClicked,
		runDestroyer: runDestroyer,
		tryDestroyer: tryDestroyer,
		tryToGainClicks: tryToGainClicks,
    runSnapshotter: runSnapshotter
	};
};
