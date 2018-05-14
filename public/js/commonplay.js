// this is our svg canvas to draw onto
var svg = d3.select("svg");

var width = +svg.attr("width");
var height = +svg.attr("height");
var color = d3.scaleOrdinal(d3.schemeCategory10);

var dragFunction = function() {
     var vb = d3.select(this).attr("viewBox");
     var toks = vb.split(" ");
     var x = parseInt(toks[0]) - d3.event.dx;
     var y = parseInt(toks[1]) - d3.event.dy;
     svg.attr("viewBox", x + " " + y + " " + toks[2] + " " + toks[3]);
}

// use dragging to pan around the graph
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

function addNode(id) {
  if (seenNodes[id]) {
    return seenNodes[id];
  } else {
    var o = {'id': id};
    nodes.push(o);
    //console.log("added node %o", o);
    // key   is id
    // value is o
    seenNodes[id] = o;
    return o;
  }
}

function addEdge(from, to) {
  var id = edgeId(from, to);
  if (from === to) {
    // why?
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

var nc = document.getElementById("nodecount");
var ec = document.getElementById("edgecount");

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

  nc.textContent = Object.keys(seenNodes).length;
  ec.textContent = Object.keys(seenEdges).length;
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

//   var forceFunction = function(){
//     var svg = d3.select("svg"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height");
//
//     svg.selectAll("*").remove();
//     //svg.clear();
//
//   var color = d3.scaleOrdinal(d3.schemeCategory20);
//
//   var simulation = d3.forceSimulation()
//     .force("link", d3.forceLink().id(function(d) { return d.id; }))
//     .force("charge", d3.forceManyBody())
//     .force("center", d3.forceCenter(width / 2, height / 2));
//
//   var link = svg.append("g")
//       .attr("class", "links")
//     .selectAll("line")
//     .data(graph.links)
//     .enter().append("line")
//       .attr("stroke-width", function(d) { return Math.sqrt(d.value); });
//
//   var node = svg.append("g")
//       .attr("class", "nodes")
//     .selectAll("circle")
//     .data(graph.nodes)
//     .enter().append("circle")
//       .attr("r", 5)
//       .attr("fill", function(d) { return color(d.group); })
//       .call(d3.drag()
//           .on("start", dragstarted)
//           .on("drag", dragged)
//           .on("end", dragended));
//
//   node.append("title")
//       .text(function(d) { return d.id; });
//
//   simulation
//       .nodes(graph.nodes)
//       .on("tick", ticked);
//
//   simulation.force("link")
//       .links(graph.links);
//
//   function ticked() {
//     link
//         .attr("x1", function(d) { return d.source.x; })
//         .attr("y1", function(d) { return d.source.y; })
//         .attr("x2", function(d) { return d.target.x; })
//         .attr("y2", function(d) { return d.target.y; });
//
//     node
//         .attr("cx", function(d) { return d.x; })
//         .attr("cy", function(d) { return d.y; });
//   }
//
//   function dragstarted(d) {
//   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
//   d.fx = d.x;
//   d.fy = d.y;
//   }
//
//   function dragged(d) {
//   d.fx = d3.event.x;
//   d.fy = d3.event.y;
//   }
//
//   function dragended(d) {
//   if (!d3.event.active) simulation.alphaTarget(0);
//   d.fx = null;
//   d.fy = null;
//   }
// }
//
// var forceFunctionOld = function() {
//
//   var svg = d3.select("svg"),
//       width = +svg.attr("width"),
//       height = +svg.attr("height");
//
//   var radius = 15;
//   // var svg = d3.select("body").append("svg")
//   //     .attr("width", width)
//   //     .attr("height", height);
//
//   //create a new instance of the force layout
//   var force = d3.layout.force()
//       .gravity(0.1) //spring attached to the center
//       .charge(-120) //nodes rel: neg make them repulse, pos attract
//       .linkDistance(10)
//       .size([width, height]);
//
//   //to optimise hover/click/touch areas
//   var voronoi = d3.geom.voronoi()
//       .x(function(d) { return d.x; })
//       .y(function(d) { return d.y; })
//       .clipExtent([[0, 0], [width, height]]);
//
//     force
//         .nodes(myData.nodes)
//         .links(myData.links)
//         .start();
//
//     var link = svg.selectAll(".link")
//         .data(myData.links)
//       .enter().append("line")
//         .attr("class", "link");
//
//     var node = svg.selectAll(".node")
//         .data(myData.nodes)
//       .enter().append("g")
//         .attr("class", "node")
//         .call(force.drag);
//
//     var circle = node.append("circle")
//         .attr("r", 4.5);
//
//     var label = node.append("text")
//         .attr("dy", ".35em")
//         .text(function(d) { return d.name; });
//
//     var cell = node.append("path")
//         .attr("class", "cell");
//
//     //access to the simulation at each loop
//     force.on("tick", function() {
//       cell
//           .data(voronoi(myData.nodes))
//           .attr("d", function(d) { return d.length ? "M" + d.join("L") : null; });
//
//       link
//           .attr("x1", function(d) { return d.source.x; })
//           .attr("y1", function(d) { return d.source.y; })
//           .attr("x2", function(d) { return d.target.x; })
//           .attr("y2", function(d) { return d.target.y; });
//
//       circle
//           .attr("cx", function(d) { return d.x; })
//           .attr("cy", function(d) { return d.y; });
//
//       label
//           .attr("x", function(d) { return d.x + 8; })
//           .attr("y", function(d) { return d.y; });
//     });
//
// };
//
// //add a new node
// var nodeSubmitElement = document.getElementById("node-submit");
//
// nodeSubmitElement.addEventListener(
//   'click', function() {
//     var friendInput = document.getElementById("friendInput");
//     var nameInput = document.getElementById("nameInput");
//     // console.log(friendInput.value);
//     // console.log(nameInput.value);
//     addPlayer(nameInput.value);
//     addConnection(nameInput.value, friendInput.value);
//
//     //nodes_data.push({"name":"Myriel","group":1});
//     //myData.push({"name":"Marie","group":1});
//
//     forceFunction();
//
//     //myData["links"].push({"source":1,"target":0,"value":3})
//
//     console.log(myData);
//   }
// );
// forceFunction();
