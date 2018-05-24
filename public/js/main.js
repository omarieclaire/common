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

function toggleDebug() {
    var x = document.getElementById("toggleDebug");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}
