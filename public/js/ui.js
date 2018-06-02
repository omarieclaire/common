var importUi = function() {

  // genDecayRate(0 minutes) = 0 energy
  // getDecayRate(1 minute) = 1 energy
  // getDecayRate(30 minutes) = 3 energy
  // getDecayRate(24 hours) = 7 energy
  // getDecayRate(1 week) = 9 energy
  // getDecayRate(1 year) = 13 energy
  function getDecayRate(lastClickTime) {
    var d = new Date();
    var millis = d.valueOf() - lastClickTime;
    var minutes = millis / (60 * 1000);
    return Math.round(Math.log1p(minutes));
  }

  function renderMyScore(state) {
    var myNode = state.seenNodes[state.selfId];
    if (myNode && myNode.score) {
      var score = myNode.score;
      var className = "";

      if (score === NODE_HEALTH_DEAD) {
        document.getElementById("node-score-me").textContent = "None";
      } else {
        className = "visual-score";
        if (score <= NODE_HEALTH_LOW) {
          className += " health-low";
        }
        document.getElementById("node-score-me").style.width = (score + 3) + "px";
        document.getElementById("node-score-me").textContent = score.toFixed();
      }

      document.getElementById("node-score-me").className = className;

      document.getElementById("player-clicks").textContent = myNode.clicks.toFixed(0);
      document.getElementById("decay-rate").textContent = getDecayRate(myNode.lastClickTime).toFixed(0);
    } else {
      //console.log("can't find my id (" + state.selfId + ") in seenNodes");
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

  var createModal = function(modalId, buttonId) {

    // Get the modal
    var modal = document.getElementById(modalId);
    // Get the button that opens the modal
    var btn = document.getElementById(buttonId);
    // Get the <span> element that closes the modal
    var span = document.querySelector("#" + modalId + " .close");
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

    createModal('aboutModal', 'aboutBtn');
    //createModal('settingsModal', 'settingsBtn');

    createModal("player-clicks-explanation", "player-clicks-explanation-btn");
    createModal("node-score-me-explanation", "node-score-me-explanation-btn");
    createModal("decay-rate-explanation", "decay-rate-explanation-btn");
    createModal("status-explanation", "status-explanation-btn");

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

  // This function is now a global
  // Use it like this:
  // reportGameStatus("Some message here")

  window.reportGameStatus = (function () {
    var statusLog = ["PLAYING BACK …"];
    var statusElem = document.getElementById("game-status");
    var timeoutId;
    var msBetweenQueuedMsgs = 60;
    var msAfterLastQueuedMsg = 3000;
    var numberMsgsToShow = 3;

    setInterval(function () {
      if (!statusElem) { return; }
      if (statusLog.length) {
        clearTimeout(timeoutId);

        statusElem.innerHTML = statusLog.slice(0, numberMsgsToShow).reverse().join("<br>");
        statusLog.shift(0);

        timeoutId = setTimeout(function () {
          statusElem.textContent = "";
        }, msAfterLastQueuedMsg);
      }
    }, msBetweenQueuedMsgs);

    return function (message) {
      // console.log("Game status update:", message);
      statusLog.push(message);
    }
  }());

  return {
    renderMyScore: renderMyScore,
    renderNetworkScores: renderNetworkScores,
    createModals: createModals,
    getDecayRate: getDecayRate
  };
};
