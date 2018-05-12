// this is our svg canvas to draw onto
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    color = d3.scaleOrdinal(d3.schemeCategory10);

// use dragging to pan around the graph
svg.call(d3.drag().on("drag", function () {
  var vb = d3.select(this).attr("viewBox");
  var toks = vb.split(" ");
  var x = parseInt(toks[0]) - d3.event.dx;
  var y = parseInt(toks[1]) - d3.event.dy;
  svg.attr("viewBox", x + " " + y + " " + toks[2] + " " + toks[3]);
}));

// set of nodes/edges we have already seen
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

addEdge("a", "b");
addEdge("b", "c");
addEdge("d", "e");
addEdge("d", "f");
addEdge("d", "g");
addEdge("e", "h");
addEdge("h", "i");
addEdge("h", "b");
addEdge("i", "a");
addEdge("i", "b");
addEdge("i", "c");
addEdge("i", "d");

function addNode(id) {
  if (seenNodes[id]) {
    return seenNodes[id];
  } else {
    var o = {id: id};
    nodes.push(o);
    //console.log("added node %o", o);
    seenNodes[id] = o;
    return o;
  }
}

function addEdge(from, to) {
  var id = edgeId(from, to);
  if (from === to) {
    addNode(from);
  } else if (seenEdges[id]) {
    //console.log("edge %o -> %o already exists", from, to);
  } else {
    var x = addNode(from);
    var y = addNode(to);
    var o = {source: x, target: y};
    links.push(o);
    seenEdges[id] = 1;
    //console.log("created edge %o", o);
  }
}

var simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("link", d3.forceLink(links).distance(100))
      .force("center", d3.forceCenter())
      .force("collide", d3.forceCollide(40))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .alphaTarget(0)
      .on("tick", ticked);


var g = svg
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var link = g
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5)
      .selectAll(".link");

var node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll(".node");

var label = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll(".node");

restart();

function restart() {
  // Apply the general update pattern to the nodes.
  node = node.data(nodes, function(d) { return d.id;});
  node.exit().remove();
  node = node.enter()
    .append("circle")
    .attr("fill", function(d) { return color(d.id) })
    .attr("r", 8)
    .merge(node);

  label = label.data(nodes, function(d) { return d.id;});
  label.exit().remove();
  label = label.enter()
    .append("text")
    .text(function(d) { return d.id })
    .style("fill", "#000000")
    .style("stroke", "#000000")
    .merge(label);

  // Apply the general update pattern to the links.
  link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
  link.exit().remove();
  link = link.enter().append("line").merge(link);

  // Update and restart the simulation.
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();
}

function ticked() {
  node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
  label
    .attr("x", function(d){ return d.x + 5; })
    .attr("y", function(d) {return d.y - 5; });
}

// used to generate random nodes
var index = 1;

window.onload = function () {
  document.getElementById("add").addEventListener('click', function () {
    var from = document.getElementById("from").value;
    var to = document.getElementById("to").value;
    //console.log("click %o %o", from, to);
    addEdge(from, to);
    restart();
  });

  document.getElementById("random").addEventListener('click', function () {
    var from;
    if (_.random(1) === 0) {
      // create a new node
      from = "rr" + index;
      index += 1;
    } else {
      var from = _.sample(seenNodes).id;
    }
    var to = _.sample(seenNodes).id;
    addEdge(from, to);
    restart();
  });
};
