var importScores = function(ui) {

  //calculate the health of the network (factors: number of edges,
  // strength of edges, and number of people)
  function calculateNetworkHealth(numEdges, sumEdgesStrength, numPeople) {
    var averageEdgePerPerson = sumEdgesStrength / numPeople;
    return averageEdgePerPerson;
  };

  //find the network score of a given node
  // also pass in a render function that will
  // accept a networks as an argument.
  function calculateNetworkScoresByNode(edges, nodes) {

    // first, build a dictionary which associates each node ID with the
    // IDs it is directly connected to. sometimes this would be called
    // an "adjacency matrix".
    var dict = {};
    _.each(edges, function (edge) {

      const targets = dict[edge.source.id] || [];
      targets.push({dest: edge.target.id, strength: edge.strength});
      dict[edge.source.id] = targets;

      const sources = dict[edge.target.id] || [];
      sources.push({dest: edge.source.id, strength: edge.strength});
      dict[edge.target.id] = sources;
    });

    var networks = [];
    var seen = {}

    // in-progress
    var currentNetworkId = 1;

    //var networkQueue = nodes.slice(0, nodes.length);
    var networkQueue = _.sortBy(nodes, function (node) { return node.id });
    while (networkQueue.length > 0) {
      var node = networkQueue.pop();
      if (!seen[node.id]) {
        var currentPeople = [];
        var currentScore = 0;
        var currentNumEdges = 0;

        var queue = [{dest: node.id}];
        while (queue.length > 0) {
          var obj = queue.pop();
          var id = obj.dest;
          if (!seen[id]) {
            currentPeople.push(id);
            var neighbors = dict[id] || [];
            _.each(neighbors, function (neighbor) {
              currentScore += neighbor.strength;
              currentNumEdges++;
            });
            queue = queue.concat(neighbors);
            seen[id] = 1;
          }
        }

        var health = calculateNetworkHealth(currentNumEdges, currentScore, currentPeople.length);

        networks.push({
          network: currentNetworkId,
          people: currentPeople,
          score: currentScore,
          numEdges: currentNumEdges,
          health: health
        });
        currentNetworkId += 1;
      }
    }
    ui.renderNetworkScores(networks);
    return networks;
  };

  // edges: [a -> b, a -> c, b -> d, c -> d]
  //
  // dict: { a -> [b, c], b -> [d], c -> [d] }

  // each edge has:
  // - {source: nodeId, target: nodeId, strength: number}
  function calculateCommonScore(edges, id) {

    // first, build a dictionary which associates each node ID with the
    // IDs it is directly connected to. sometimes this would be called
    // an "adjacency matrix".
    var dict = {};
    _.each(edges, function (edge) {

      const targets = dict[edge.source.id] || [];
      targets.push({dest: edge.target.id, strength: edge.strength});
      dict[edge.source.id] = targets;

      const sources = dict[edge.target.id] || [];
      sources.push({dest: edge.source.id, strength: edge.strength});
      dict[edge.target.id] = sources;
    });

    var score = 0;
    var seen = {}; // nodes we've already counted
    var queue = [{dest: id}]; // nodes we need to count
    while (queue.length > 0) {
      var obj = queue.pop();
      var id = obj.dest;
      if (!seen[id]) {
        var neighbors = dict[id] || [];
        _.each(neighbors, function (neighbor) {
          score += neighbor.strength;
        });
        queue = queue.concat(neighbors);
        seen[id] = 1;
      }
    }

    //console.log("score = %o", score);
    document.getElementById("iscore").textContent = score.toString();

    var networkScores = calculateNetworkScoresByNode(edges, nodes);
    console.log("network scores = %o", networkScores);

    return score;
  };


  return {
    calculateNetworkHealth: calculateNetworkHealth,
    calculateNetworkScoresByNode: calculateNetworkScoresByNode,
    calculateCommonScore: calculateCommonScore
  };

};
