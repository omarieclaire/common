  var graph = {
    "nodes":[],
    "links":[]
  };

  var people = {
  };

  // var graph = {
  //   "nodes":[
  //     {"id": "Aaron", "group": 1},
  //   ],
  //   "links":[]
  // };

  var addPlayer = function(id){
    if (people[id]) {
      //do nothing
    } else {
      graph.nodes.push({"id": id, "group": 1});
      people[id]=1;
    }

  }
  var addConnection = function(id1, id2){
    graph.links.push({"source": id1, "target": id2, "value": 1})
  }
  var removeConnection = function(id1, id2){}

  addPlayer("Aaron");
  addPlayer("Marie");
  addPlayer("Erik");
  addConnection("Aaron", "Marie");
  addConnection("Marie", "Erik");

  // var graph = {
  //   "nodes":[
  //     {"id": "Aaron", "group": 1},
  //     {"id": "Marie", "group": 1},
  //   ],
  //   "links":[
  //     {"source": "Aaron", "target": "Marie", "value": 1},
  //   ]
  // };


  var forceFunction = function(){
    var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    svg.selectAll("*").remove();
    //svg.clear();

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 5)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
  }

  function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
  }

  function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
  }
}

var forceFunctionOld = function() {

  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");



  var radius = 15;
  // var svg = d3.select("body").append("svg")
  //     .attr("width", width)
  //     .attr("height", height);

  //create a new instance of the force layout
  var force = d3.layout.force()
      .gravity(0.1) //spring attached to the center
      .charge(-120) //nodes rel: neg make them repulse, pos attract
      .linkDistance(10)
      .size([width, height]);

  //to optimise hover/click/touch areas
  var voronoi = d3.geom.voronoi()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .clipExtent([[0, 0], [width, height]]);

    force
        .nodes(myData.nodes)
        .links(myData.links)
        .start();

    var link = svg.selectAll(".link")
        .data(myData.links)
      .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(myData.nodes)
      .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    var circle = node.append("circle")
        .attr("r", 4.5);

    var label = node.append("text")
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    var cell = node.append("path")
        .attr("class", "cell");

    //access to the simulation at each loop
    force.on("tick", function() {
      cell
          .data(voronoi(myData.nodes))
          .attr("d", function(d) { return d.length ? "M" + d.join("L") : null; });

      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      circle
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

      label
          .attr("x", function(d) { return d.x + 8; })
          .attr("y", function(d) { return d.y; });
    });

};

//add a new node
var nodeSubmitElement = document.getElementById("node-submit");

nodeSubmitElement.addEventListener(
  'click', function() {
    var friendInput = document.getElementById("friendInput");
    var nameInput = document.getElementById("nameInput");
    // console.log(friendInput.value);
    // console.log(nameInput.value);
    addPlayer(nameInput.value);
    addConnection(nameInput.value, friendInput.value);


//    nodes_data.push({"name":"Myriel","group":1});
    //myData.push({"name":"Marie","group":1});
    // Access the "nodes" value of the myData json object.
    // note: myData is JSON, which can contain many types of data
    // specifcally, key-value pairs.

    forceFunction();

    //myData["links"].push({"source":1,"target":0,"value":3})

    console.log(myData);

  }
);
forceFunction();
