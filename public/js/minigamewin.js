document.addEventListener("DOMContentLoaded", function() {

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  var createUser = firebase.functions().httpsCallable("createUserAndInvite");
  var usernameLabel = document.getElementById("usernameLabel");
  var emailLabel = document.getElementById("emailLabel");

  firebase.auth().onAuthStateChanged(function(user) {

    document.getElementById("join").addEventListener("click", function(ev) {
      var failure = false;
      usernameLabel.style.color = "black";
      emailLabel.style.color = "black";

      var emailEntered = document.getElementById('email').value;
      var usernameEntered = document.getElementById('username').value;

      if (usernameEntered.length == 0) {
        usernameLabel.style.color = "red";
        failure = true;
      }
      if (validateEmail(emailEntered) == false) {
        emailLabel.style.color = "red";
        failure = true;
      }

      if(failure) {
        ev.preventDefault();
        return false;
      }

      var sender = user.displayName || 'UNKNOWN';

      createUser({email: emailEntered, username: usernameEntered, sender: sender}, {}).then(function(result) {

        // Read result of the Cloud Function.
        console.log(result.data);
        if(result.data.success) {
          document.getElementById('status').innerHTML = "Success";
        } else {
          document.getElementById('status').innerHTML = "Failed :(";
        }

        var promise = new Promise(function(resolve, reject) {
          setTimeout(function() {
            window.location.href = "commonplay.html";
            resolve();
          }, 1000);
        });

        return promise;
      });
    });
  });
});
