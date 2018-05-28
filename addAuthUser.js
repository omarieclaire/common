var admin = require('firebase-admin');

var serviceAccount = require('serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://common-d2ecf.firebaseio.com"
});

var authAdmin = admin.auth();

if(process.argv.length < 5) {
  console.log("pass in arguments <email> <username> <pass>");
  return;
}

var email = process.argv[2];
var username = process.argv[3];
var pass = process.argv[4];

admin.auth().createUser({
  //uid: username,
  email: email,
  emailVerified: false,
  password: pass,
  displayName: username,
  disabled: false
});
