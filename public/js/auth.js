var importAuth = function(firebase, dbModule) {

  var database = firebase.database();

  var signInSuccessFunction = function(authResult, redirectUrl) {
    var username = window.localStorage.getItem("username");

    window.localStorage.setItem("current-username", username);
    window.localStorage.setItem("current-email", authResult.user.email);

    if(authResult.additionalUserInfo.isNewUser) {
      var email = authResult.user.email;
      if(username) {
        dbModule
          .createPlayer(username, email)
          .then(function() {
            dbModule.sendLog({
              type: "invite",
              email: email,
              sender: null,
              recipient: username,
              startingLife: STARTING_LIFE
            })
          });
      } else {
        console.log("could not find username after login, this is bad.");
        return false;
      }
    }
    return true;
  };

  var uiConfig = {
    autoUpgradeAnonymousUsers: false,

    //the user has sucessfully signed in so tell them to go to index
    signInSuccessUrl: 'commonplay.html',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      //firebase.auth.GithubAuthProvider.PROVIDER_ID,
      { provider: firebase.auth.EmailAuthProvider.PROVIDER_ID, requireDisplayName: false },
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: 'tos.html',
    callbacks: {
      signInSuccessWithAuthResult: signInSuccessFunction
    }
  };

  return {
    uiConfig: uiConfig
  };
};
