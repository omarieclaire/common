<!-- email username sender -->
document.getElementById("join").onclick = joinButtonClicked;

function joinButtonClicked() {
  document.getElementById("usernameLabel").style.color = "black";
  document.getElementById("emailLabel").style.color = "black";

  if (document.getElementById("username").value.length == 0) {
    document.getElementById("usernameLabel").style.color = "red";
    return;
  }
  if (validateEmail(document.getElementById('email').value) == false) {
    document.getElementById("emailLabel").style.color = "red";
    return;
  }

  console.log('what what')

  var createUser = firebase.functions().httpsCallable("createUserAndInvite");
  createUser({email: "david@block-party.net", username: "david", sender: "butt"}, {}).then(function(result) {

    // Read result of the Cloud Function.
    var sanitizedMessage = result.data.text;
    document.getElementById('status').innerHTML = sanitizedMessage;
  });

  // setTimeout(function() {
  //   window.location.href = "commonplay.html"; //will redirect to your blog page (an ex: blog.html)
  // }, 1000); //will call the function after 2 secs.
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
