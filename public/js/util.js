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

  function playerEdgesSet(node, edges) {
    var set = new Set();
    edges.forEach(function(edge) {
      if(edge.source.id === node.id || edge.target.id === node.id) {
        set.add(edge.id);
      }
    });
    return set;
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
  // sender = true
  // receiver = false
  function addNode(id, state, score, clicks, lastClickTime, lastClickGainedAt) {
    // check if the id was already added
    var node = state.seenNodes[id];
    if (node) {
      return node;
    } else {
      // create a new node object

      var o = {
        "id": id,
        color: state.colorPicker(id),
        score: score ? score : INITIAL_NODE_SCORE,
        clicks: clicks ? clicks : INITIAL_CLICKS,
        lastClickTime: lastClickTime ? lastClickTime : COMMON_EPOCH,
        lastClickGainedAt: lastClickGainedAt ? lastClickGainedAt : 0,
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
      // add the edges to the array of edges
      state.edges.push(o);
      // add the edge id to the seenEdges object
      state.seenEdges[id] = o;
      scores.calculateCommonScore(state);
    }
  }

  // Deletes edges
  function deleteEdge(edge, state) {
    delete state.seenEdges[edge.id];
    // TODO: optimize this.
    var index = state.edges.indexOf(edge);
    state.edges.splice(index, 1);
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
    deactivateNode(node, state);
    var deletedEdges = [];
    for (var i = state.edges.length - 1; i >= 0; i--) {
      var edge = state.edges[i];
      if(edge.source.id === node.id || edge.target.id === node.id) {
        deletedEdges.push(edge.id);
        deleteEdge(edge, state);
      }
    }
    deletedEdges.forEach(function(edgeId) {
      delete state.seenEdges[edgeId];
    });
  }

  function nodeRadius(node) {
    if(node.score > NODE_HEALTH_FULL) {
      return 8;
    } else if(node.score > NODE_HEALTH_HIGH) {
      return 7;
    } else if(node.score > NODE_HEALTH_MEDIUM) {
      return 6;
    } else if(node.score > NODE_HEALTH_LOW) {
      return 5;
    } else if(node.score > NODE_HEALTH_DEAD) {
      return 4;
    } else {
      // DEAD
      return 3;
    }
  }

  function nodeClass(node, state) {
    var classString = "";
    if(node.score > NODE_HEALTH_FULL) {
      classString += "nodeFull"
    } else if(node.score > NODE_HEALTH_HIGH) {
      classString += "nodeHigh ";
    } else if(node.score > NODE_HEALTH_MEDIUM) {
      classString += "nodeMedium ";
    } else if(node.score > NODE_HEALTH_LOW) {
      classString += "nodeLow ";
    } else if(node.score > NODE_HEALTH_DEAD) {
      classString += "nodeDanger ";
    } else {
      classString += "nodeDead ";
    }

    if(node.id === state.selfId) {
      classString += "myNode nodeClass";
      return classString;
    } else {
      classString += "nodeClass";
      return classString;
    }
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
    health: health,
    killPlayer: killPlayer,
    nodeRadius: nodeRadius,
    nodeClass: nodeClass,
    playerEdgesSet: playerEdgesSet
  };
};
