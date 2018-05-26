var importUi = function() {

  function renderMyScore(myId, seenNodes) {
    var myNode = seenNodes[myId];
    if(myNode) {
      var html = document.getElementById("node-score-me");
      html.textContent = myNode.score;
    } else {
      console.log("can't find my id (" + myId + ") in seenNodes");
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

  return {
    renderMyScore: renderMyScore,
    renderNetworkScores: renderNetworkScores,
  };
};
