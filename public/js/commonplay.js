/* global d3:false _:false */

//default starting strength for each edge
var DEFAULT_STRENGTH = 1;
//capping the strength of each edge
var MAX_EDGE_STRENGTH = 6;
//default starting strength for each node
var INITIAL_NODE_SCORE = 8;
//the default amount of "life-force" a network receives
var GIVER_POWER = 0.5;
//the default amount of "life force" decayed by entropy/destroyer
var DESTROYER_POWER = 0.5;
//the "life force" a player trades to strengthen a connection
var CLICK_NODE_DESTROYER_POWER = 0.5;
//the edge-strength increase-when the node is clicked
var CLICK_EDGE_INCREMENTER = 0.5;

// this is the svg canvas to draw onto
var svg = d3.select("svg");

// attributes of the svg canvas as variables
var svgWidth = +svg.attr("width");
var svgHeight = +svg.attr("height");
var colorPicker = d3.scaleOrdinal(d3.schemeCategory10);

// set of nodes/edges we have already seen (objects)
var seenNodes = {};
var seenEdges = {};

// list of node/edge data used by the force-directed graph
var nodes = [];
var links = [];

function renderMyScore() {
	var myNode = seenNodes[me];
	if(myNode) {
		var html = document.getElementById("node-score-me");
		html.textContent = myNode.score;
	} else {
		console.log("can't find ME :(");
	}
}
//draw network scores to screen
function renderNetworkScores(networkScores) {
	var scoreHtml = document.getElementById("network-score");
	// clear the html elements
	while(scoreHtml.firstChild){
    scoreHtml.removeChild(scoreHtml.firstChild);
	}
	_.each(networkScores, function(networkScore) {
		var liHtml = document.createElement("LI");
		liHtml.textContent =
			"network: " +
			networkScore.network +
			" score: " +
			networkScore.score +
			" health: " +
			networkScore.health.toFixed(2) +
			" people: " +
			networkScore.people.toString();
		scoreHtml.appendChild(liHtml);
	});
}
//calculate the health of the network (factors: number of edges,
// strength of edges, and number of people)
function calculateNetworkHealth(numEdges, sumEdgesStrength, numPeople) {
	var averageEdgePerPerson = sumEdgesStrength / numPeople;
	return averageEdgePerPerson;
}

//find the network score of a given node
function calculateNetworkScoresByNode(edges, nodes) {

  // first, build a dictionary which associates each node ID with the
  // IDs it is directly connected to. sometimes this would be called
  // an "adjacency matrix".
  var dict = {};
  _.each(edges, function (edge) {

    const targets = dict[edge.source.id] || [];
    targets.push({dest: edge.target.id, strength: edge.strength});
    dict[edge.source.id] = targets;

    const sources = dict[edge.target.id] || [];
    sources.push({dest: edge.source.id, strength: edge.strength});
    dict[edge.target.id] = sources;
  });

  var networks = [];
  var seen = {}

  // in-progress
  var currentNetworkId = 1;

  //var networkQueue = nodes.slice(0, nodes.length);
  var networkQueue = _.sortBy(nodes, function (node) { return node.id });
  while (networkQueue.length > 0) {
    var node = networkQueue.pop();
    if (!seen[node.id]) {
      var currentPeople = [];
      var currentScore = 0;
			var currentNumEdges = 0;

      var queue = [{dest: node.id}];
      while (queue.length > 0) {
        var obj = queue.pop();
        var id = obj.dest;
        if (!seen[id]) {
          currentPeople.push(id);
          var neighbors = dict[id] || [];
          _.each(neighbors, function (neighbor) {
            currentScore += neighbor.strength;
						currentNumEdges++;
          });
          queue = queue.concat(neighbors);
          seen[id] = 1;
        }
      }

			var health = calculateNetworkHealth(currentNumEdges, currentScore, currentPeople.length);

      networks.push({
				network: currentNetworkId,
				people: currentPeople,
				score: currentScore,
				numEdges: currentNumEdges,
				health: health
			});
      currentNetworkId += 1;
    }
  }
	renderNetworkScores(networks);
  return networks;
}

// edges: [a -> b, a -> c, b -> d, c -> d]
//
// dict: { a -> [b, c], b -> [d], c -> [d] }

// each edge has:
// - {source: nodeId, target: nodeId, strength: number}
function calculateCommonScore(edges, id) {

  // first, build a dictionary which associates each node ID with the
  // IDs it is directly connected to. sometimes this would be called
  // an "adjacency matrix".
  var dict = {};
  _.each(edges, function (edge) {

    const targets = dict[edge.source.id] || [];
    targets.push({dest: edge.target.id, strength: edge.strength});
    dict[edge.source.id] = targets;

    const sources = dict[edge.target.id] || [];
    sources.push({dest: edge.source.id, strength: edge.strength});
    dict[edge.target.id] = sources;
  });

  var score = 0;
  var seen = {}; // nodes we've already counted
  var queue = [{dest: id}]; // nodes we need to count
  while (queue.length > 0) {
    var obj = queue.pop();
    var id = obj.dest;
    if (!seen[id]) {
      var neighbors = dict[id] || [];
      _.each(neighbors, function (neighbor) {
        score += neighbor.strength;
      });
      queue = queue.concat(neighbors);
      seen[id] = 1;
    }
  }

  //console.log("score = %o", score);
  document.getElementById("iscore").textContent = score.toString();

  var networkScores = calculateNetworkScoresByNode(edges, nodes);
  console.log("network scores = %o", networkScores);

	return score;
};

// given two node IDs, produce a consistent edge ID.
function edgeId(from, to) {
	if (from < to) {
		return from + "-" + to;
	} else {
		return to + "-" + from;
	}
}

// given a node id, add a node
// this function returns the node
function addNode(id) {
	// check if the id was already added
	if (seenNodes[id]) {
		// the id was added, so return the node
		return seenNodes[id];
	} else {
		// create a new node object
		var o = {
			"id": id,
			color: colorPicker(id),
			score: INITIAL_NODE_SCORE
		};
		// add the new node to the array of nodes
		nodes.push(o);
		// add the id and node to the seenNodes object
		seenNodes[id] = o;
		// return the node
		return o;
	}
}

// Given a 'from' id and a 'to' id, add an edge
// this function returns nothing
function addEdge(from, to, strength) {
	// calculate the edge id
	var id = edgeId(from, to);
	if (from === to) {
		// if 'from' id is equal to 'to' id, assume we're adding
		// a node and not an edge.
		addNode(from);
	} else if (seenEdges[id]) {
		// if 'from' and 'to' are different, but
		// we've seen the id before, do nothing
		//console.log("edge %o -> %o already exists", from, to);
	} else {
		// if 'from' and 'to' are different and ne
		// add a node for 'from' in case it doesn't exist
		var x = addNode(from);
		// add a node for 'to' in case it doesn't exist
		var y = addNode(to);
		// create a new edge
		var o = {id: id, source: x, target: y, strength: strength};
		// add the edges to the array of edges
		links.push(o);
		// add the edge id to the seenEdges object
		seenEdges[id] = 1;
    calculateCommonScore(links, "i");
	}
}

function destroyEdge(edge) {
  _
}

function getNode(id){
	return seenNodes[id];
}

// add a bunch of edges for the example
addEdge("i", "d", 3);
addEdge("b", "c", 1);
addEdge("d", "e", 3);
addEdge("i", "f", 1);
addEdge("d", "g", 1);
addEdge("i", "h", 2);
addEdge("h", "i", 1);
addEdge("h", "b", 2);
addEdge("i", "a", 1);
addEdge("e", "b", 1);
addEdge("i", "c", 2);
addEdge("i", "d", 1);

//pretend we know who the user is, "i"
var me = "i";

// create a d3 simulation object?
var simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceManyBody().strength(-1000))
	.force("link", d3.forceLink(links).distance(70))
	.force("center", d3.forceCenter())
	.force("collide", d3.forceCollide(40))
	.force("x", d3.forceX())
	.force("y", d3.forceY())
	.alphaTarget(0.0)
	.on("tick", ticked);

// create a <g> element and append it into <svg>
//create the graph itself
var g = svg
	.append("g");

// zooming funtion given to d3
// <svg transform="translate(10) + scale(2)">;
var zoomFunction = function() {
	var transWidth =  d3.event.transform.x; // + (svgWidth/2);
	var transHeight = d3.event.transform.y; // + (svgHeight/2);
	g.attr("transform", d3.event.transform);
};


// call zooming function when d3 detects a zoom
//svg.call(d3.zoom().on("zoom", zoomFunction));
var zoomCall = d3.zoom().scaleExtent([1 / 4, 4]).on("zoom", zoomFunction);

svg.call(zoomCall.transform, d3.zoomIdentity.translate(svgWidth / 2, svgHeight / 2) );
svg.call(zoomCall);

// create a <g> elements, append it to the previous g
var link = g
	.append("g")
	.attr("stroke", "#000")
	.attr("stroke-width", 1.5)
	.selectAll(".link");

// create a <g> element, append it to the first g
var node = g
	.append("g")
	.attr("stroke", "#fff")
	.attr("stroke-width", 1.5)
	.selectAll(".node");

// create a <g> element, append it to the first g
var label = g
	.append("g")
	.attr("stroke", "#fff")
	.attr("stroke-width", 1.5)
	.selectAll(".node");

// get the nodecount HTML node
var nc = document.getElementById("nodecount");
// get the edgecount HTML node
var ec = document.getElementById("edgecount");

// Deletes edges
function deleteEdge(edge) {
	var index = links.indexOf(edge);
	console.log("DELETE EDGE: " + edge + " at index " + index);
	delete seenEdges[edge.id];
	links.splice(index,1);
}

// Deletes nodes
function deleteNode(node) {
	// first delete all the edges that refer to this node
	_.each(links, function(link) {
		if(link) {
			if(link.source.id == node.id || link.target.id == node.id) {
				deleteEdge(link);
			}
		}
	});

	// now delete the node
	delete seenNodes[node.id];
	var index = nodes.indexOf(node);
	console.log("DELETE NODE: " + node + " at index " + index);
	nodes.splice(index,1);
}

//nodeclick function
//why isn't it redrawing!!!?
function nodeClick(d) {
	var target = d.id;
	//reference to the link between me and the targe
	var ourLink = links.filter(function (link) {
		return link.source.id == me && link.target.id == target ||
      link.target.id == me && link.source.id == target;
	})[0];

	// if clicking on a link attached to our nodes
	// decrement our score
	if (ourLink){
		if(ourLink.strength < MAX_EDGE_STRENGTH) {
		  ourLink.strength = ourLink.strength + CLICK_EDGE_INCREMENTER;

			// get our node from the seenNodes object (efficient)
			var ourNode = seenNodes[me];
			// decrement our score
			ourNode.score = ourNode.score - CLICK_NODE_DESTROYER_POWER;
			if(ourNode.score <= 0) {
				deleteNode(ourNode);
			}
	  }
    calculateCommonScore(links, me);
	} else {
		console.log(d, "No Link!");
	}

	// get the node we clicked on.
	// filter returns true when the id matches target.
	var clickedNodeFilter = function (n) {
		return n.id == target;
	};
	// clickedNodes is an array with each node having id 'target'
	// (hopefully only one)
	var clickedNodes = nodes.filter(clickedNodeFilter);
	// take the first element of clickedNodes
	var clickedNode = clickedNodes[0];

	if(clickedNode) {
		// if the node was clicked, set its color to black
		clickedNode.color = "#00000";
	} else {
		console.log(d, "no node!");
	}

	//good time to send update to firebase
	draw();
}

//getting the strength of an edge by its id
function connectionStrength(d) {
	return d.strength;
}

// draw refreshes the graph?
draw();

// render the score for the first time
renderMyScore();

// function to refresh d3 (for any changes to the graph)?
function draw() {
	// Apply the update to the nodes.
	// get nodes array, extract ids, and draw them
	node = node.data(nodes, function(d) { return d.id;});
	// exit and remove before redrawing?
	node.exit().remove();
	// redraw the nodes
	//enter is a d3 method being called on node
	//whatever this process returns: append is called on it
	node = node.enter()
		.append("circle")
	//fill takes a color but instead of giving a color I give it
	// an anon function that returns a color
		.attr("fill", function(d) { return d.color; })
		.attr("r", 8)
	//we added the onclick to the circle, but maybe we should have added it to the node
		.on("click", nodeClick)
	//what does this mean?
		.merge(node);

	// do the same thing for the labels
	label = label.data(nodes, function(d) { return d.id;});

	//I removed line below because it didn't do anything?
	label.exit().remove();
	label = label.enter()
		.append("text")
		.text(function(d) {return d.id;})
		.style("fill", "#000000")
		.style("stroke", "#000000")
		.merge(label);

	// do the same thing for the links
	link = link.data(links, function(d) {	return d.source.id + "-" + d.target.id;	});
	link.exit().remove();
	//before .merge is where I can add the viz representation of the stroke/connection
	link = link.enter()
		.append("line")
		.attr("stroke-width", connectionStrength)
		.merge(link);

	// Update and restart the simulation.
	simulation.nodes(nodes);
	simulation.force("link").links(links);
	simulation.alpha(1).restart();

	// update the node and edge counts
	// can we instead call nodes.length and edges.length?
	nc.textContent = Object.keys(seenNodes).length;
	ec.textContent = Object.keys(seenEdges).length;
}

// function called on every "tick" of d3 like a clock or gameloop
function ticked(e) {
	node
	//cx is the relative position of the node
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.attr("r", function(d) { return d.score; })
		.attr("fill", function(d) { return d.color;})

	link
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
		.attr("stroke-width", connectionStrength);
	label
		.attr("x", function(d) { return d.x + 5; })
		.attr("y", function(d) { return d.y - 5; });
}

// used to generate random nodes
var index = 1;

// when the window is ready, call the function below
window.onload = function() {

	// add a function when "add" button is clicked
	document.getElementById("add").addEventListener("click", function() {
		// get the text from the 'from' form
		var from = document.getElementById("from").value;
		// get the text from the to' form
		var to = document.getElementById("to").value;
		//console.log("click %o %o", from, to);

		// add an edge between `from` and `to`
		addEdge(from, to, DEFAULT_STRENGTH);

		// redraw.
		draw();
	});

	// add a function when the `random` button is clicked
	document.getElementById("random").addEventListener("click", function() {

		// create a random name for a new node
		// find an existing node to connect it
		// connect the nodes
		var from;
		if (_.random(1) === 0) {
			// create a new node
			from = "rr" + index;
			index += 1;
		} else {
			from = _.sample(seenNodes).id;
		}
		var to = _.sample(seenNodes).id;
		addEdge(from, to, DEFAULT_STRENGTH);
		draw();
	});

  document.getElementById("destroy").addEventListener("click", function () {
    var index = _.random(0, links.length - 1);
    var edge = links[index];
		if(edge) {
	    if (edge.strength <= DESTROYER_POWER) {
	      console.log("destroying %o", edge);
				// how does this work? Should we use our deleteEdge function?
				deleteEdge(edge);
	      destroyEdge(edge);
	    } else {
	      console.log("weakening %o", edge);
	      edge.strength -= DESTROYER_POWER;
	    }
		}

		var randomNodeIndex = _.random(0, nodes.length -1);
		var node = nodes[randomNodeIndex];
		node.score = node.score - DESTROYER_POWER;
		if(node.score <= 0) {
			console.log("deleting node: " + node);
			deleteNode(node);
		}

		calculateNetworkScoresByNode(links, nodes);
		renderMyScore();
		draw();
  });

	document.getElementById("giver").addEventListener("click", function() {
		var networkScores = calculateNetworkScoresByNode(links,nodes);
		_.each(nodes, function(node) {
			var network = networkScores.filter(function(network) {
				return network.people.indexOf(node.id) != -1;
			})[0]
			if(network) {
				node.score = node.score + GIVER_POWER * network.health;
			} else {
				console.log("YIKES! Could not find a network for node " + node.id);
			}
		});
		renderMyScore();
		draw();
	});

	// Get the "reset-button" add a function to be executed on click
	document.getElementById("reset-button").addEventListener("click", function () {
		// https://stackoverflow.com/questions/46342757/d3-v4-zoom-using-transitions-doesnt-seem-to-work
		// svg is the d3 selection of our svg html element.
		// creating a transition on the svg, for a duration of 500ms
		//svg.call(zoomCall.scaleTo, 1) is equivalent to zoomCall.scaleTo(svg,1)
		// create a transition element of duration 500ms with initial state
		// the current svg, and final state the svg after calling zoomCall.scaleTo(1)
		// and begin transition
		svg.transition().duration(500).call(zoomCall.scaleTo, 1).transition();
	});

	document.getElementById("zoom-in").addEventListener("click", function() {
		var currentScale = d3.zoomTransform(svg.node()).k;
		svg.transition().duration(500).call(zoomCall.scaleTo, currentScale + 0.1).transition();
	});

	document.getElementById("zoom-out").addEventListener("click", function() {
		var currentScale = d3.zoomTransform(svg.node()).k;
		svg.transition().duration(500).call(zoomCall.scaleTo, currentScale - 0.1).transition();
	});

};
