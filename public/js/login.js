//when the dom content is loaded, do the following
document.addEventListener('DOMContentLoaded', function() {

  // log the user out when clicking on the link.
  document.getElementById("logout-anchor").addEventListener("click", function(e) {
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

    var loginDiv = document.getElementById("login");
    var logoutDiv = document.getElementById("logout");

    //if the user is logged in then user is not null
    if (user) {
      loginDiv.style.display = "none";
      logoutDiv.style.display = "block";
    } else {
      loginDiv.style.display = "block";
      logoutDiv.style.display = "none";
    }
  });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

});
