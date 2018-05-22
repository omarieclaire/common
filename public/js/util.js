var importUtil = function(scores, ui) {
  //create html id for each edge so we can change visuals
  function edgeIdAttr(edge) {
    return "edge-" + edge.id;
  }

  //create html id for each node so we can change visuals
  function nodeIdAttr(node) {
    return "node-" + node.id;
  }

  // Given a node and edges, find all connected edges to that node.
  function getEdgesForNode(node, edges) {
    var connectedEdgesForNode = edges.filter(function(edge){
      return edge.source.id == node.id || edge.target.id == node.id;
    });

    return connectedEdgesForNode;
  }

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
  //function addNode(id, myId, nodes, seenNodes, colorPicker) {
  function addNode(id, state) {
    // check if the id was already added
    if (state.seenNodes[id]) {
      // the id was added, so return the node
      return state.seenNodes[id];
    } else {
      // create a new node object
      var o = {
        "id": id,
        color: state.colorPicker(id),
        score: INITIAL_NODE_SCORE,
        x: 0,
        y:0,
        get r() {
          return this.score;
        }
      };

      if (id === state.selfId) {
        o.fx = MY_FIXED_X;
        o.fy = MY_FIXED_Y;
      }
      // add the new node to the array of nodes
      state.nodes.push(o);
      // add the id and node to the seenNodes object
      state.seenNodes[id] = o;
      // return the node
      return o;
    }
  }

  // Given a 'from' id and a 'to' id, add an edge
  // this function returns nothing
  //function addEdge(from, to, strength, myId, nodes, edges, seenNodes, seenEdges, colorPicker) {
  function addEdge(from, to, strength, state) {
    // calculate the edge id
    var id = edgeId(from, to);
    if (from === to) {
      // if 'from' id is equal to 'to' id, assume we're adding
      // a node and not an edge.
      addNode(from, state);
    } else if (state.seenEdges[id]) {
      // if 'from' and 'to' are different, but
      // we've seen the id before, do nothing
      //console.log("edge %o -> %o already exists", from, to);
    } else {
      // if 'from' and 'to' are different and ne
      // add a node for 'from' in case it doesn't exist
      var x = addNode(from, state);
      // add a node for 'to' in case it doesn't exist
      var y = addNode(to, state);
      // create a new edge
      var o = {id: id, source: x, target: y, strength: strength};
      // add the edges to the array of edges
      state.edges.push(o);
      // add the edge id to the seenEdges object
      state.seenEdges[id] = 1;
      scores.calculateCommonScore(state.edges, state.selfId, ui.renderNetworkScores);
    }
  }

  // Deletes edges
  function deleteEdge(edge, edges, seenEdges) {
    var index = edges.indexOf(edge);
    console.log("DELETE EDGE: " + edge + " at index " + index);
    delete seenEdges[edge.id];
    edges.splice(index,1);
  }

  // Deletes nodes
  function deleteNode(node, nodes, seenNodes, edges, seenEdges) {
    // first, clone the array (this fixed a bug where looping
    // and slicing over the array caused an issue)
    // This is potentially expensive if we have a lot of edges.
    var clonedEdges = edges.slice(0);

    // first delete all the edges that refer to this node
    _.each(clonedEdges, function(edge) {
      if(edge) {
        if(edge.source.id == node.id || edge.target.id == node.id) {
          deleteEdge(edge, edges, seenEdges);
        }
      }
    });

    // now delete the node
    delete seenNodes[node.id];
    var index = nodes.indexOf(node);
    console.log("DELETE NODE: " + node + " at index " + index);
    nodes.splice(index,1);
  }

  // Small helper function to calculate nodes by network
  function nodesByNetwork(nodes) {
    var nodesByNetwork = {};
    nodes.forEach(function(data) {
      // note: if a node doesn't have a network yet, we skip it.
      if(data.network) {
        if(nodesByNetwork[data.network]) {
          nodesByNetwork[data.network].push(data);
        } else {
          nodesByNetwork[data.network] = [data];
        }
      }
    });
    return nodesByNetwork;
  }

  return {
    edgeIdAttr: edgeIdAttr,
    nodeIdAttr: nodeIdAttr,
    getEdgesForNode: getEdgesForNode,
    edgeId: edgeId,
    addNode: addNode,
    addEdge: addEdge,
    deleteEdge: deleteEdge,
    deleteNode: deleteNode,
    nodesByNetwork: nodesByNetwork
  };
};
