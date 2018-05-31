var importUi = function() {

  // genDecayRate(0 minutes) = 0 energy
  // getDecayRate(1 minute) = 1 energy
  // getDecayRate(30 minutes) = 3 energy
  // getDecayRate(24 hours) = 7 energy
  // getDecayRate(1 week) = 9 energy
  // getDecayRate(1 year) = 13 energy
  function getDecayRate(state) {
    var d = new Date();
    var millis = d.valueOf() - state.lastClickTime;
    var minutes = millis / (60 * 1000);
    return Math.round(Math.log1p(minutes));
  }

  function renderMyScore(state) {
    var myNode = state.seenNodes[state.selfId];
    if (myNode && myNode.score) {
      document.getElementById("node-score-me").textContent = myNode.score.toFixed(0);
      document.getElementById("player-clicks").textContent = state.playerClicks.toFixed(0);
      document.getElementById("decay-rate").textContent = getDecayRate(state).toFixed(0);
    } else {
      console.log("can't find my id (" + state.selfId + ") in seenNodes");
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

  var createModal = function(modalId, buttonId, spanIndex) {

    // Get the modal
    var modal = document.getElementById(modalId);
    // Get the button that opens the modal
    var btn = document.getElementById(buttonId);
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[spanIndex];
    // When the user clicks on the button, open the modal
    btn.onclick = function() {
      modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    //window.onclick = function(event) {
    window.addEventListener('click', function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }

  function createModals() {

    createModal('aboutModal', 'aboutBtn', 0);
    createModal('settingsModal', 'settingsBtn', 1);

    // var myData = [];

    document.getElementById("toggleDebugBtn").addEventListener("click", function() {
      var x = document.getElementById("toggleDebug");
      if (x.style.display === "none" || x.style.display === "") {
        x.style.display = "block";
      } else {
        x.style.display = "none";
      }
    });
  };

  return {
    renderMyScore: renderMyScore,
    renderNetworkScores: renderNetworkScores,
    createModals: createModals,
    getDecayRate: getDecayRate
  };
};
