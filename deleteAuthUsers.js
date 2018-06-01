var admin = require('firebase-admin');

var serviceAccount = require('serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://common-d2ecf.firebaseio.com"
});

var authAdmin = admin.auth();

authAdmin.listUsers().then(function(result) {
  var listOfPromises = result.users.map(function(user) {
    authAdmin.deleteUser(user.uid);
  });
  Promise.all(listOfPromises).then(function() {
    console.log("deleted users");
  });
  return true;
});
