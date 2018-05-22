var importUi = function() {

  function renderMyScore(myId, seenNodes) {
    var myNode = seenNodes[myId];
    if(myNode) {
      var html = document.getElementById("node-score-me");
      html.textContent = myNode.score;
    } else {
      console.log("can't find ME :(");
    }
  }

  //draw network scores to screen
  function renderNetworkScores(networkScores) {
    var scoreHtml = document.getElementById("network-score");
    // clear the html elements
    while(scoreHtml.firstChild){
      scoreHtml.removeChild(scoreHtml.firstChild);
    }
    _.each(networkScores, function(networkScore) {
      var liHtml = document.createElement("LI");
      liHtml.textContent =
        "network: " +
        networkScore.network +
        " score: " +
        networkScore.score +
        " health: " +
        networkScore.health.toFixed(2) +
        " people: " +
        networkScore.people.toString();
      scoreHtml.appendChild(liHtml);
    });
  }

  return {
    renderMyScore: renderMyScore,
    renderNetworkScores: renderNetworkScores,
  };
};
