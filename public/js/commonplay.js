/* global d3:false _:false */

// IMPORT
var ui = importUi();
var scores = importScores(ui);
var util = importUtil(scores, ui);
var db = importDb(scores, ui, util);
var action = importAction(ui, util, db);

/*
// this is the svg canvas to draw onto
var svg = d3.select("svg");

// attributes of the svg canvas as variables
var svgWidth = +svg.attr("width");
var svgHeight = +svg.attr("height");
*/

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#F8F8F8");

var state = {
  // index used by random button
  randomIndex: 1,
  // tracks if we are done loading yet (true) or not (false)
  loaded: false,
  // id of the current user (same as ME)
  selfId: "omarieclaire",
  // reference to SVG node and info
  svg: svg,
  svgWidth: svgWidth,
  svgHeight: svgHeight,
  // color picker
  colorPicker: d3.scaleOrdinal(["#A07A19", "#AC30C0", "#EB9A72", "#BA86F5", "#EA22A8"]),
  // directory of known players
  players: {},
  // set of nodes/edges we have already seen (objects)
  seenNodes: {},
  seenEdges: {},
  // list of node/edge data used by the force-directed graph
  nodes: [],
  edges: [],
  // method used to draw the graph
  draw: draw
};

// start listening to DB updates
db.initPlayers(state);
db.initLog(state);

// create a d3 simulation object
var simulation = d3.forceSimulation(state.nodes)
	//for making elements attract or repel one another
	.force("charge", d3.forceManyBody().strength(-500))
	//for creating a fixed distance between connected elements
	.force("link", d3.forceLink(state.edges).distance(1))
	//for setting the center of gravity of the system
	.force("center", d3.forceCenter())
	//for preventing elements overlapping
	.force("collide", d3.forceCollide(40))
	//for attracting elements to a given point
	.force("x", d3.forceX())
	//for attracting elements to a given point
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
	g.attr("transform", d3.event.transform);
};

// call zooming function when d3 detects a zoom
//svg.call(d3.zoom().on("zoom", zoomFunction));
var zoomCall = d3.zoom().scaleExtent([1 / 4, 4]).on("zoom", zoomFunction);
svg.call(zoomCall.transform, d3.zoomIdentity.translate(svgWidth / 2, svgHeight / 2) );
svg.call(zoomCall);

// create a <g> element for edges, append it to the previous g
var edge = g
	.append("g")
	.attr("stroke", "#000")
	.attr("stroke-width", 1.5)
	.selectAll(".edge");

// create a <g> element for annotations, append it to the first g
var annotationAnchor = g.append("g").attr("stroke", "#E8336D").selectAll(".anchor");

// create a <g> element for nodes, append it to the first g
var node = g
	.append("g")
	.attr("stroke", "#fff")
	.attr("stroke-width", 1.5)
	.attr("id", "g-node")
	.selectAll(".node");

// create a <g> element for labels, append it to the first g
var label = g
	.append("g")
	.attr("stroke", "#fff")
	.attr("stroke-width", 1.5)
	.selectAll(".label");

// get the nodecount HTML node
var nc = document.getElementById("nodecount");
// get the edgecount HTML node
var ec = document.getElementById("edgecount");

// small helper function to claculate all enclosed circles
// assumes nodesByNetwork is map (key-value pairs) of
// key=netowrk-id
// value=nodes in network-id
function enclosedCirclesByNetwork(nodesByNetwork) {
  var enclosedCircles = [];
  Object.keys(nodesByNetwork).forEach(function(network,index) {
    var nodesInNetwork = nodesByNetwork[network];
    var enclosedCircle = d3.packEnclose(nodesInNetwork);
    enclosedCircle.id = "enclosing-network-" + index;
    enclosedCircles.push(enclosedCircle);
  });
  return enclosedCircles;
}

// extremely side-effecty function
function doAnnotations(enclosedCircles, annotationAnchor) {
  var annotations = enclosedCircles.map(function(circle,index) {
    return {
      id: "annotation-" + index,
      note: {  title: "10" },
      dy: -circle.r - 3,
      dx: 0,
      x: circle.x,
      y: circle.y,
      type: d3.annotationCalloutCircle,
      subject: {
        radius: circle.r,
        radiusPadding: 15
      }
    };
  });

  annotationAnchor = annotationAnchor.data(annotations, function(d) { return d.id;});
  annotationAnchor.exit().remove();

  var makeAnnotations = d3.annotation().annotations(annotations).accessors({ x: function x(d) {
    return d.x;
  }, y: function y(d) {
    return d.y;
  } });

  annotationAnchor.enter().call(makeAnnotations);
}

//getting the strength of an edge by its id
function edgeStrength(d) {
	return d.strength;
}

// draw refreshes the graph?
draw();

// render the score for the first time
ui.renderMyScore(state.selfId, state.seenNodes);

// function to refresh d3 (for any changes to the graph)?
function draw() {
	// Apply the update to the nodes.
	// get nodes array, extract ids, and draw them
	node = node.data(state.nodes, function(d) { return d.id;});
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
		.attr("r", function(d) { return d.score; })
		// add an id attribute to each node, so we can access/select it later
		.attr("id", util.nodeIdAttr)
	//we added the onclick to the circle, but maybe we should have added it to the node
		//.on("click", nodeClick)
		.on("click", function (d) { action.nodeClicked(state, d) })
	//what does this mean?
		.merge(node);

  // In order to draw circles around each network, we calculate
  // the network scores. Then we mutate each node by adding
  // the network it belongs to.
  // Then we group each node by the network it belngs to
  // Then we use that group and d3.packEnclose to encircle the networks.
  // TODO it would be good to find a better place to calculate this stuff
  // rather than in draw
  var networkScores = scores.calculateNetworkScoresByNode(state.edges, state.nodes);
  // add a radius to the data
  node.data().forEach(function(d) {
    // This is slow; TODO we should improve this.
    networkScores.forEach(function(network) {
      if(network.people.indexOf(d.id) != -1) {
        d.network = network.network;
      }
    })
  });

  var nodesByNetwork = util.nodesByNetwork(node.data());
  var enclosedCircles = enclosedCirclesByNetwork(nodesByNetwork)

  doAnnotations(enclosedCircles, annotationAnchor);

	// do the same thing for the labels
	label = label.data(state.nodes, function(d) { return d.id;});

	//I removed line below because it didn't do anything?
	label.exit().remove();
	label = label.enter()
		.append("text")
		.text(function(d) {return d.id;})
		.style("fill", "#000000")
		.style("stroke", "#000000")
		.merge(label);

	// do the same thing for the edges
	edge = edge.data(state.edges, function(d) {	return d.source.id + "-" + d.target.id;	});
	edge.exit().remove();
	//before .merge is where I can add the viz representation of the stroke/edge
	edge = edge.enter()
		.append("line")
		.attr("stroke-width", edgeStrength)
		.attr("id", util.edgeIdAttr)
		.merge(edge);

	// Update and restart the simulation.
	simulation.nodes(state.nodes);
	simulation.force("link").links(state.edges);
	simulation.alpha(1).restart();

	// update the node and edge counts
	// can we instead call nodes.length and edges.length?
	nc.textContent = Object.keys(state.seenNodes).length;
	ec.textContent = Object.keys(state.seenEdges).length;
}

// function called on every "tick" of d3 like a clock or gameloop
function ticked(e) {
	node
	//cx is the relative position of the node
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.attr("r", function(d) { return d.score; })
		.attr("fill", function(d) { return d.color;});

	edge
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
		.attr("stroke-width", edgeStrength);
	label
		.attr("x", function(d) { return d.x + 5; })
		.attr("y", function(d) { return d.y - 5; });

  var nodesByNetwork = util.nodesByNetwork(node.data());
  var enclosedCircles = enclosedCirclesByNetwork(nodesByNetwork)

  doAnnotations(enclosedCircles, annotationAnchor);
}


// used to generate random nodes
var index = 1;

// when the window is ready, call the function below
window.onload = function() {

  // add a function when "add" button is clicked
  document.getElementById("add").addEventListener("click", function() {
    action.addClicked(state);
  });

  // add a function when the `random` button is clicked
  document.getElementById("random").addEventListener("click", function() {
    action.randomClicked(state);
  });

  document.getElementById("reinitialize").addEventListener("click", function () {
    action.reinitializeClicked(state);
  });

  document.getElementById("destroy").addEventListener("click", function () {
    var index = _.random(0, state.edges.length - 1);
    var edge = state.edges[index];
		if(edge) {
	    if (edge.strength <= DESTROYER_POWER) {
	      console.log("destroying %o", edge);
				// how does this work? Should we use our deleteEdge function?
				util.deleteEdge(edge, state.edges, state.seenEdges);
	      //destroyEdge(edge);
	    } else {
	      console.log("weakening %o", edge);
	      edge.strength -= DESTROYER_POWER;
	    }
		}

		var randomNodeIndex = _.random(0, state.nodes.length -1);
		var node = state.nodes[randomNodeIndex];
		node.score = node.score - DESTROYER_POWER;
		if(node.score <= 0) {
			console.log("deleting node: " + node);
			util.deleteNode(node, state.nodes, state.seenNodes, state.edges, state.seenEdges);
		}

		scores.calculateNetworkScoresByNode(state.edges, state.nodes);
		ui.renderMyScore(state.selfId, state.seenNodes);
		draw();
  });

	document.getElementById("giver").addEventListener("click", function() {
		var networkScores = scores.calculateNetworkScoresByNode(state.edges, state.nodes);
		_.each(state.nodes, function(node) {
			var network = networkScores.filter(function(network) {
				return network.people.indexOf(node.id) != -1;
			})[0]
			if(network) {
				node.score = node.score + GIVER_POWER * network.health;
			} else {
				console.log("YIKES! Could not find a network for node " + node.id);
			}
		});
		ui.renderMyScore(state.selfId, state.seenNodes);
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
		svg.transition().duration(500).call(zoomCall.translateTo,MY_FIXED_X,MY_FIXED_Y).transition().duration(500).call(zoomCall.scaleTo, 1).transition();
	});

	document.getElementById("zoom-in").addEventListener("click", function() {
		var currentScale = d3.zoomTransform(svg.node()).k;
		svg.transition().duration(500).call(zoomCall.scaleTo, currentScale + ZOOM_AMOUNT).transition();
	});

	document.getElementById("zoom-out").addEventListener("click", function() {
		var currentScale = d3.zoomTransform(svg.node()).k;
		svg.transition().duration(500).call(zoomCall.scaleTo, currentScale - ZOOM_AMOUNT).transition();
	});


  state.loaded = true;
};
