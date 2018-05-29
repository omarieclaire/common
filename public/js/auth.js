var importAuth = function(firebase, dbModule) {

  var database = firebase.database();

  var signInSuccessFunction = function(authResult, redirectUrl) {
    return true;
  };

  var uiConfig = {
    autoUpgradeAnonymousUsers: false,

    //the user has sucessfully signed in so tell them to go to index
    signInSuccessUrl: '/',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      //firebase.auth.GithubAuthProvider.PROVIDER_ID,
      //firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      { provider: firebase.auth.EmailAuthProvider.PROVIDER_ID, requireDisplayName: false }
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
