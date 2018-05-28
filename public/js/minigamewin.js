<!-- email username sender -->
document.addEventListener("DOMContentLoaded", function() {
document.getElementById("join").onclick = joinButtonClicked;
var createUser = firebase.functions().httpsCallable("createUserAndInvite");

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

    var emailEntered = document.getElementById('email').value;
    var usernameEntered = document.getElementById('username').value;


  createUser({email: emailEntered, username: usernameEntered, sender: "butt"}, {}).then(function(result) {

    // Read result of the Cloud Function.
    console.log(result.data);
    if(result.data.success) {
      document.getElementById('status').innerHTML = "Success";
    } else {
      document.getElementById('status').innerHTML = "Failed :(";
    }
    setTimeout(function() {
      window.location.href = "commonplay.html"; //will redirect to your blog page (an ex: blog.html)
    }, 1000); //will call the function after 2 secs.

  });


}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

});
