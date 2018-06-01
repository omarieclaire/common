//when the dom content is loaded, do the following
document.addEventListener('DOMContentLoaded', function() {

  // log the user out when clicking on the link.
  document.getElementById("logout").addEventListener("click", function(e) {
    e.preventDefault();
    firebase.auth().signOut().then(function() {
      console.log("sign-out success!");
      window.location.reload();
    }).catch(function(error) {
      console.log("sign-out error!", error);
      window.location.reload();
    });
  });


  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  firebase.auth().onAuthStateChanged(function(user) {

    var username = document.getElementById("username");
    var login = document.getElementById("login");
    var logout = document.getElementById("logout");
    var loadingIndicator = document.getElementById("loading-indicator");

    loadingIndicator.style.display = "none";

    //if the user is logged in then user is not null
    if (user) {
      username.innerText = user.displayName;
      login.style.display = "none";
      logout.style.display = "inline";
    } else {
      username.innerText = "";
      login.style.display = "inline";
      logout.style.display = "none";
    }
  });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

});
