// The things that the users do in the app. Click events should go here.

var importAction = function(ui, util, scores, db) {

  function addEdge(from, to, state) {
    if (state.players[from] == null) {
      db.sendInvite("omarieclaire", from, from+"@fake.com");
    }

    if (state.players[to] == null) {
      db.sendInvite(from, to, to+"@fake.com");
      return;
    }

    var eid = util.edgeId(from, to);
    if (!state.seenEdges[eid]) {
      db.newConnection(from, to, DEFAULT_STRENGTH);
    } else {
      db.giveStrength(from, to, DEFAULT_STRENGTH);
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
    // decrement our score
    if (ouredge){
      // get our node from the seenNodes object (efficient)
      var ourNode = state.seenNodes[state.selfId];
      if(ouredge.strength < MAX_EDGE_STRENGTH && ourNode.score > 2) {
        db.reinforceConnection(ourNode.id, target, CLICK_EDGE_INCREMENTER, CLICK_NODE_DESTROYER_POWER);
        playSound("reinforcing-connection-sound", 0.2);
        // begin edge animation
        var htmlEdge = document.getElementById(util.edgeIdAttr(ouredge));
        d3.select(htmlEdge).transition().duration(1000).attr("stroke", "#00FF00").transition().duration(1500).attr("stroke", null);
        // d3.select(htmlEdge).transition().duration(1000).attr("stroke-dasharray", "5, 5").transition().duration(1500).attr("stroke-dasharray", null);

        // begin node animation
        var htmlNode = document.getElementById(util.nodeIdAttr(d));
        // d3.select(htmlNode).transition().duration(10).style("fill","magenta").transition().duration(1500).style("fill", d.color);

      }
    } else if (ourNode.score > 2) {
      //console.log(d, "Not our edge!");
      d3.select(htmlNode).transition().duration(10).style("fill","#8FBC8F").transition().duration(1500).style("fill", d.color);
      playSound("poor-sound", 0.2);
    } else {
      //console.log(d, "Not our edge!");
      d3.select(htmlNode).transition().duration(10).style("fill","#8FBC8F").transition().duration(1500).style("fill", d.color);
      playSound("error-sound", 0.2);
    }

    scores.calculateCommonScore(state.edges, state.nodes, state.selfId);
    state.draw();
  }

  function addClicked(state) {
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
    var i = _.random(0, state.edges.length - 1);
    var edge = state.edges[i];
    if (edge) {
      db.weakenEdge(edge.source, edge.target, DESTROYER_POWER);
    }

    var j = _.random(0, state.nodes.length -1);
    var node = state.nodes[j];
    if (node) {
      db.weakenNode(node.id, DESTROYER_POWER);
    }
  }

  function reinitializeClicked(state) {
    db.reinitialize(state);
  }

  return {
    addEdge: addEdge,
    addClicked: addClicked,
    randomClicked: randomClicked,
    reinitializeClicked: reinitializeClicked,
    nodeClicked: nodeClicked,
    runDestroyer: runDestroyer
  };
};
