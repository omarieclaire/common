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
        alive: true,
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
  function addEdge(from, to, state) {
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
      var o = {id: id, source: x, target: y};
      // revive the target player if they're dead.
      y.alive = true;
      // add the edges to the array of edges
      state.edges.push(o);
      // add the edge id to the seenEdges object
      state.seenEdges[id] = o;
      scores.calculateCommonScore(state);
    }
  }

  // Deletes edges
  function deleteEdge(edge, state) {
    var index = state.edges.indexOf(edge);
    console.log("DELETE EDGE: " + edge + " at index " + index);
    delete state.seenEdges[edge.id];
    state.edges.splice(index,1);
  }

  function deactivateNode(node, state) {
    node.score = 0;
    // TODO: change the styling for this node
  }

  function currentTimeMillis() {
    var d = new Date();
    return d.valueOf();
  }

  // Small helper function to calculate nodes by network
  function nodesByNetwork(nodes) {
    var nodesByNetwork = {};
    nodes.forEach(function(node) {
      // note: if a node doesn't have a network yet, we skip it.
      if(node.network) {
        if(nodesByNetwork[node.network]) {
          nodesByNetwork[node.network].nodes.push(node);
        } else {
          var entry = {
            nodes: [node],
            score: node.networkScore
          };
          nodesByNetwork[node.network] = entry;
        }
      }
    });
    return nodesByNetwork;
  }

  /**
   * given an array of edges, reconstruct
   * the seenEdges map (a map from edgeId to
   * the edge)
   */
  function recoverSeenEdges(edges) {
    var seenEdges = {};
    edges.forEach(function(edge) {
      seenEdges[edge.id] = edge;
    });
    return seenEdges;
  }

  /**
   * given an array of nodes, reconstruct
   * the seenNodes map (a mpa from node id t
   * the node)
   */
  function recoverSeenNodes(nodes) {
    var seenNodes = {};
    nodes.forEach(function(node) {
      seenNodes[node.id] = node;
    });
    return seenNodes;
  }

  function clicks(n) {
    // ensure the result is between 0 and 100
    return Math.min(6, Math.max(0, n));
  }

  function health(n) {
    // ensure the result is between 0 and 100
    return Math.min(100, Math.max(0, n));
  }

  function killPlayer(node, state) {
    node.alive = false;
    var deletedEdges = [];
    for (var i = state.edges.length - 1; i >= 0; i--) {
      var edge = state.edges[i];
      if(edge.source === node.id || edge.target === node.id) {
        deletedEdges.push(edge.id);
        deleteEdge(edge);
      }
    }
    deletedEdges.forEach(function(edgeId) {
      delete state.seenEdges[edgeId];
    });
  }

  return {
    edgeIdAttr: edgeIdAttr,
    nodeIdAttr: nodeIdAttr,
    getEdgesForNode: getEdgesForNode,
    edgeId: edgeId,
    addNode: addNode,
    addEdge: addEdge,
    deleteEdge: deleteEdge,
    nodesByNetwork: nodesByNetwork,
    recoverSeenNodes: recoverSeenNodes,
    recoverSeenEdges: recoverSeenEdges,
    currentTimeMillis: currentTimeMillis,
    clicks: clicks,
    health: health
  };
};
