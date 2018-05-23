var importAction = function(ui, util, db) {

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
      console.log(ourNode.score);
      if(ouredge.strength < MAX_EDGE_STRENGTH && ourNode.score > 2) {
        ouredge.strength = ouredge.strength + CLICK_EDGE_INCREMENTER;
        // decrement our score
        ourNode.score = ourNode.score - CLICK_NODE_DESTROYER_POWER;

        // begin edge animation
        var htmlEdge = document.getElementById(util.edgeIdAttr(ouredge));
        d3.select(htmlEdge).transition().duration(1000).attr("stroke", "magenta").transition().duration(1500).attr("stroke", null);
        // d3.select(htmlEdge).transition().duration(1000).attr("stroke-dasharray", "5, 5").transition().duration(1500).attr("stroke-dasharray", null);

        // begin node animation
        var htmlNode = document.getElementById(util.nodeIdAttr(d));
        d3.select(htmlNode).transition().duration(10).style("fill","magenta").transition().duration(1500).style("fill", d.color);

      }
    } else {
      //console.log(d, "Not our edge!");
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

  function reinitializeClicked(state) {
    db.reinitialize(state);
  }

  return {
    addEdge: addEdge,
    addClicked: addClicked,
    randomClicked: randomClicked,
    reinitializeClicked: reinitializeClicked,
    nodeClicked: nodeClicked
  };
};
