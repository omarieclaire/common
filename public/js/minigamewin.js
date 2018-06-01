document.addEventListener("DOMContentLoaded", function() {

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  var createUser = firebase.functions().httpsCallable("createUserAndInvite");
  var emailExistsFunc = firebase.functions().httpsCallable("emailExists");
  var usernameInput = document.getElementById("username");
  var usernameLabel = document.getElementById("usernameLabel");
  var usernameErrorMsg = document.getElementById("username-error-msg");
  var emailInput = document.getElementById("email");
  var emailLabel = document.getElementById("emailLabel");
  var emailErrorMsg = document.getElementById("email-error-msg");
  var statusElement = document.getElementById("status");
  var submitButton = document.getElementById("join");
  var submittingMsg = document.getElementById("submitting-msg");
  var youAreConnectingElement = document.getElementById("common-you-are-connecting");

  // import database, but we can only access a few methods
  // since we're passing null util and null scores.
  var database = importDb(null, firebase, null);

  firebase.auth().onAuthStateChanged(function(user) {
    if(user) {

      usernameInput.addEventListener("focus", function(ev) {
        usernameErrorMsg.innerHTML = "";
        statusElement.innerHTML = "";
        usernameLabel.style.color = "black";
      });

      emailInput.addEventListener("focus", function(ev) {
        emailErrorMsg.innerHTML = "";
        statusElement.innerHTML = "";
        emailLabel.style.color = "black";
      });

      youAreConnectingElement.innerHTML = "you are connecting with 👯 " + user.displayName + " 👯";

      document.getElementById("join").addEventListener("click", function(ev) {
        var failure = false;
        usernameLabel.style.color = "black";
        emailLabel.style.color = "black";

        var emailEntered = emailInput.value;
        var usernameEntered = usernameInput.value;

        if (usernameEntered.length == 0) {
          usernameLabel.style.color = "red";
          usernameErrorMsg.innerHTML = "username cannot be empty like the void that is our universe";
          failure = true;
        }
        if (validateEmail(emailEntered) == false) {
          emailLabel.style.color = "red";
          if(emailEntered.length === 0) {
            emailErrorMsg.innerHTML = "email cannot be empty like an inbox that's never opened";
          } else {
            emailErrorMsg.innerHTML = "email must be a valid email and must not be a tautology";
          }

          failure = true;
        }

        if (failure) {
          ev.preventDefault();
          return false;
        } else {
          submitButton.disabled = true;
          submittingMsg.innerHTML = "attempting to make a connection …";
        }

        database.userExists(usernameEntered).then(function(exists) {
          console.log(exists);
          if (exists) {
            usernameLabel.style.color = "red";
            usernameErrorMsg.innerHTML = "username already exists :(";
            //ev.preventDefault();
            return Promise.reject(new Error("username-exists"));
          } else {
            return Promise.resolve(true);
          }
        }).then(function(result) {
          // check if email exists
          return emailExistsFunc(emailEntered).then(function(emailExists) {
            if (emailExists.data) {
              emailLabel.style.color = "red";
              emailErrorMsg.innerHTML = "email already exists :(";
              //ev.preventDefault();
              return Promise.reject(new Error("email-exists"));
            } else {
              return Promise.resolve(true);
            }
          }).then(function(result) {

            var sender = user.displayName || 'UNKNOWN';

            console.log("about to create user. sender:", sender);
            createUser({email: emailEntered, username: usernameEntered, sender: sender}, {}).then(function(result) {

              // Read result of the Cloud Function.
              console.log("RESULT OF CLOUD FUNCTION", result.data);
              if(result.data.success) {
                document.getElementById('status').innerHTML = "Success";
              } else {
                document.getElementById('status').innerHTML = "Failed :(";
              }

              var promise = new Promise(function(resolve, reject) {
                setTimeout(function() {
                  window.location.href = "/";
                  resolve();
                }, 1000);
              });

              return promise;
            });
          }).catch(function(error) {
            ev.preventDefault();
            if(error.message !== "email-exists" && error.message !== "username-exists") {
              document.getElementById('status').innerHTML = "Failed and we don't know why :(";
            }
            submitButton.disabled = false;
            return false;
          });
        });
      });
    } else {
      submitButton.disabled = true;
      statusElement.innerHTML = "you must be signed in to invite someone :(";
    }
  });
});
