//when the dom content is loaded, do the following
document.addEventListener('DOMContentLoaded', function() {

  // log the user out when clicking on the link.
  document.getElementById("logout").addEventListener("click", function() {
    firebase.auth().signOut().then(function() {
      document.getElementById('auth-msg').innerHTML = "";
      window.localStorage.removeItem("current-username");
      window.localStorage.removeItem("current-email");
      console.log("sign-out success!");
    }).catch(function(error) {
      console.log("sign-out error!");
    });
  });

  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
  // // The Firebase SDK is initialized and available here!
  //
  firebase.auth().onAuthStateChanged(function(user) {
    //grab auth element
    let auth_msg = document.getElementById("auth-msg");
    let auth_element = document.getElementById("auth-element");
    var loginDiv = document.getElementById("login");
    //if the user is logged in then user is not null
    if (user) {
      loginDiv.style.display = "none";
      auth_msg.innerHTML = "Yay, you're logged in!";
    } else {
      loginDiv.style.display = "block";
    }
  });
  // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
  // firebase.messaging().requestPermission().then(() => { });
  // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
  //
  // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

  try {
    document.getElementById('load').innerHTML = '';
  } catch (e) {
    console.error(e);
    document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
  }
});
