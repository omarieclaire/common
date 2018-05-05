//create somewhere to put the force directed graph
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var radius = 15;

var nodes_data =  [
    {"name": "Marie", "sex": "F"},
    {"name": "Aaron", "sex": "F"}
    ]

//Sample links data
//type: A for Ally, E for Enemy
var links_data = [
    {"source": "Marie", "target": "Aaron", "type":"E"}
]

//set up the simulation and add forces
var simulation = d3.forceSimulation()
          .nodes(nodes_data);

var link_force =  d3.forceLink(links_data)
                        .id(function(d) { return d.name; });

var charge_force = d3.forceManyBody()
    .strength(-100);

var center_force = d3.forceCenter(width / 2, height / 2);

simulation
    .force("charge_force", charge_force)
    .force("center_force", center_force)
    .force("links",link_force)
 ;

/** Functions **/

//Function to choose what color circle we have
//Let's return blue for males and red for females
function circleColour(d){
  if(d.sex =="M"){
    return "blue";
  } else {
    return "pink";
  }
}

//Function to choose the line colour and thickness
//If the link type is "A" return green
//If the link type is "E" return red
function linkColour(d){
  if(d.type == "A"){
    return "green";
  } else {
    return "red";
  }
}

//Drag functions
//d is the node
function drag_start(d) {
 if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

//make sure you can't drag the circle outside the box
function drag_drag(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function drag_end(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}


function restart() {


   function tickActions() {
       //update circle positions each tick of the simulation
          node
           .attr("cx", function(d) { return d.x; })
           .attr("cy", function(d) { return d.y; });

       //update link positions
       link
           .attr("x1", function(d) { return d.source.x; })
           .attr("y1", function(d) { return d.source.y; })
           .attr("x2", function(d) { return d.target.x; })
           .attr("y2", function(d) { return d.target.y; });
   }

   //Zoom functions
   function zoom_actions(){
       g.attr("transform", d3.event.transform)
   }

  //add tick instructions:
  simulation.on("tick", tickActions );

  //add encompassing group for the zoom
  var g = svg.append("g")
      .attr("class", "everything");

  //draw lines for the links
  var link = g.append("g")
        .attr("class", "links")
      .selectAll("line")
      .data(links_data)
      .enter().append("line")
        .attr("stroke-width", 2)
        .style("stroke", linkColour);

  //draw circles for the nodes
  var node = g.append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(nodes_data)
          .enter()
          .append("circle")
          .attr("r", radius)
          .attr("fill", circleColour);


  //add drag capabilities
  var drag_handler = d3.drag()
    .on("start", drag_start)
    .on("drag", drag_drag)
    .on("end", drag_end);

  drag_handler(node);


  //add zoom capabilities
  var zoom_handler = d3.zoom()
      .on("zoom", zoom_actions);


  zoom_handler(svg);
}

// only run this code when the whole website has been downloaded
// and all the HTML parsed and "read"
document.addEventListener('DOMContentLoaded', function(){
  document.getElementById("node-submit").addEventListener(
    'click', function() {
      console.log(nodes_data);
      console.log("hi marie!");
      nodes_data.push({"name": "roro", "sex": "M"});
      restart();
    }
  );}, false);

restart();
