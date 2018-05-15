/* global d3:false _:false */

//default strength for all connections
var DEFAULT_STRENGTH = 1;

// this is the svg canvas to draw onto
var svg = d3.select("svg")

// attributes of the svg canvas as variables
var width = +svg.attr("width");
var height = +svg.attr("height");
var color = d3.scaleOrdinal(d3.schemeCategory10);

// dragging function given to d3
var dragFunction = function() {
	var vb = d3.select(this).attr("viewBox");
	var tokens = vb.split(" ");
	var x = parseInt(tokens[0]) - d3.event.dx;
	var y = parseInt(tokens[1]) - d3.event.dy;
	svg.attr("viewBox", x + " " + y + " " + tokens[2] + " " + tokens[3]);
};

// call dragging function when d3 detects a drag
svg.call(d3.drag().on("drag", dragFunction));

// set of nodes/edges we have already seen (objects)
var seenNodes = {};
var seenEdges = {};

// list of node/edge data used by the force-directed graph
var nodes = [];
var links = [];

// given two node IDs, produce an edge ID.
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
			"id": id
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
		var o = {source: x, target: y};
		// add the edges to the array of edges
		links.push(o);
		// add the edge id to the seenEdges object
		seenEdges[id] = strength;
		//console.log("created edge %o", o);
	}
}

function getNode(id){
	return seenNodes[id];
}

// add a bunch of edges for the example
addEdge("a", "b", 3);
addEdge("b", "c", 1);
addEdge("d", "e", 3);
addEdge("d", "f", 1);
addEdge("d", "g", 1);
addEdge("e", "h", 2);
addEdge("h", "i", 1);
addEdge("h", "b", 2);
addEdge("i", "a", 1);
addEdge("i", "b", 1);
addEdge("i", "c", 2);
addEdge("i", "d", 1);

// create a d3 simulation object?
var simulation = d3.forceSimulation(nodes)
	.force("charge", d3.forceManyBody().strength(-1000))
	.force("link", d3.forceLink(links).distance(100))
	.force("center", d3.forceCenter())
	.force("collide", d3.forceCollide(40))
	.force("x", d3.forceX())
	.force("y", d3.forceY())
	.alphaTarget(0)
	.on("tick", ticked);

// create a <g> element and append it into <svg>
//create the graph itself
var g = svg
	.append("g")
//setting the zoom level
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// zooming funtion given to d3
// <svg transform="translate(10) + scale(2)">;
var zoomFunction = function() {
	g.attr("transform", "translate(" + d3.event.transform.x + ")" + " scale(" + d3.event.transform.k + ")");
};

// call zooming function when d3 detects a zoom
svg.call(d3.zoom().on("zoom", zoomFunction));

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

//nodeclick function
function nodeClick(d) {
	console.log(this);
}

//getting the strength of an edge by its id 
function connectionStrength(d) {
  return seenEdges[edgeId(d.source.id, d.target.id)];
}

// restart refreshes the graph?
draw();

// function to refresh d3 (for any changes to the graph)
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
		.attr("fill", function(d) { return color(d.id) })
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
function ticked() {
	node
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });
	link
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });
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
		addEdge(from, to);

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
};
