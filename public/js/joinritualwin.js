document.addEventListener("DOMContentLoaded", function() {

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  var bannedWords = [
    "beeyotch",
    "biatch",
    "bitch",
    "chinaman",
    "chinamen",
    "chink",
    "crazie",
    "crazy",
    "crip",
    "cunt",
    "dago",
    "daygo",
    "dego",
    "dick",
    "dumb",
    "douchebag",
    "dyke",
    "fag",
    "fatass",
    "fatso",
    "gash",
    "gimp",
    "golliwog",
    "gook",
    "gyp",
    "halfbreed",
    "half-breed",
    "homo",
    "hooker",
    "idiot",
    "insane",
    "insanitie",
    "insanity",
    "jap",
    "kike",
    "kraut",
    "lame",
    "lardass",
    "lesbo",
    "lunatic",
    "negro",
    "nigga",
    "nigger",
    "nigguh",
    "paki",
    "pickaninnie",
    "pickaninny",
    "pussie",
    "pussy",
    "raghead",
    "retard",
    "shemale",
    "skank",
    "slut",
    "spade",
    "spic",
    "spook",
    "tard",
    "tits",
    "titt",
    "trannie",
    "tranny",
    "twat",
    "wetback",
    "whore",
    "wop"
];

  var createUser = firebase.functions().httpsCallable("createUserAndInvite");
  var emailExistsFunc = firebase.functions().httpsCallable("emailExists");
  var usernameInput = document.getElementById("username");
  var usernameLabel = document.getElementById("usernameLabel");
  var usernameErrorMsg = document.getElementById("username-error-msg");
  var emailInput = document.getElementById("email");
  var emailLabel = document.getElementById("emailLabel");
  var emailErrorMsg = document.getElementById("email-error-msg");
  var statusElement = document.getElementById("status");
  var submitButton = document.getElementById("join") || document.getElementById("connect");
  var submittingMsg = document.getElementById("submitting-msg");
  var youAreConnectingElement = document.getElementById("common-you-are-connecting");

  // import database, but we can only access a few methods
  // since we're passing null util and null scores.
  var database = importDb(null, firebase, null);

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

  var validateAndSubmit = function (ev, emailEntered, usernameEntered) {
    var failure = false;
    usernameLabel.style.color = "black";
    emailLabel.style.color = "black";

    // non-empty username
    if (usernameEntered.length == 0) {
      usernameLabel.style.color = "red";
      usernameErrorMsg.innerHTML = "username cannot be empty like the void that is our universe";
      failure = true;
    }

    // username isn't a banned word.
    if(bannedWords.includes(usernameEntered)) {
      usernameLabel.style.color = "red";
      usernameErrorMsg.innerHTML = "That username is already taken by a bigot.";
      failure = true;
    }

    if(usernameEntered.length > MAXIMUM_USERNAME_LENGTH) {
      usernameLabel.style.color = "red";
      usernameErrorMsg.innerHTML = "Username is too looooooooooooooong. Length cannot be more than the 'o's."
    }

    // non-empty and/or valid email
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
  };

  var createConnection = function (emailEntered, usernameEntered) {
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
  };

  var handleError = function (ev, error) {
    ev.preventDefault();
    if(error.message !== "email-existence" && error.message !== "username-existence") {
      document.getElementById('status').innerHTML = "Failed and we don't know why :(";
    }
    submitButton.disabled = false;
    submittingMsg.innerHTML = "";
    return false;
  };

  firebase.auth().onAuthStateChanged(function(user) {
    if(user) {

      youAreConnectingElement.innerHTML = "you are connecting with 👯 " + user.displayName + " 👯";

      document.getElementById("join") && document.getElementById("join").addEventListener("click", function(ev) {
        var emailEntered = emailInput.value.trim();
        var usernameEntered = usernameInput.value.trim();

        validateAndSubmit(ev, emailEntered, usernameEntered);

        database.userExists(usernameEntered).then(function(exists) {
          console.log(exists);
          if (exists) {
            usernameLabel.style.color = "red";
            usernameErrorMsg.innerHTML = "username already exists :(";

            submitButton.disabled = false;
            submittingMsg.innerHTML = "";

            //ev.preventDefault();
            return Promise.reject(new Error("username-existence"));
          } else {
            return Promise.resolve(true);
          }
        }).then(function(result) {
          // check if email exists
          return emailExistsFunc(emailEntered).then(function(emailExists) {
            if (emailExists.data) {
              emailLabel.style.color = "red";
              emailErrorMsg.innerHTML = "email already exists :(";

              submitButton.disabled = false;
              submittingMsg.innerHTML = "";

              //ev.preventDefault();
              return Promise.reject(new Error("email-existence"));
            } else {
              return Promise.resolve(true);
            }
          }).then(function(result) {
            createConnection(emailEntered, usernameEntered);
          }).catch(function(error) {
            handleError(ev, error);
          });
        });
      });

      document.getElementById("connect") && document.getElementById("connect").addEventListener("click", function(ev) {
        var emailEntered = emailInput.value.trim();
        var usernameEntered = usernameInput.value.trim();

        validateAndSubmit(ev, emailEntered, usernameEntered);

        database.userExists(usernameEntered).then(function(exists) {
          console.log(exists);
          if (!exists) {
            usernameLabel.style.color = "red";
            usernameErrorMsg.innerHTML = "that username does not exist :(";

            submitButton.disabled = false;
            submittingMsg.innerHTML = "";

            //ev.preventDefault();
            return Promise.reject(new Error("username-existence"));
          } else {
            return Promise.resolve(true);
          }
        }).then(function(result) {
          // check if email exists
          return emailExistsFunc(emailEntered).then(function(emailExists) {
            if (!emailExists.data) {
              emailLabel.style.color = "red";
              emailErrorMsg.innerHTML = "email does not already exist :(";

              submitButton.disabled = false;
              submittingMsg.innerHTML = "";

              //ev.preventDefault();
              return Promise.reject(new Error("email-existence"));
            } else {
              return Promise.resolve(true);
            }
          }).then(function(result) {
            createConnection(emailEntered, usernameEntered);
          }).catch(function(error) {
            handleError(ev, error);
          });
        });
      });
    } else {
      submitButton.disabled = true;
      statusElement.innerHTML = "you must be signed in to invite someone :(";
    }
  });
});
