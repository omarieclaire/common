const functions = require('firebase-functions');
// Firebase Setup
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const gmailCredentials = require('./gmail.json');
const passgen = require('./passgen.json');

const nodemailer = require('nodemailer');
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailCredentials.email,
    pass: gmailCredentials.password,
  },
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generatePassphrase() {
  var randomAdjective = getRandomInt(passgen.adjectives.length);
  var randomVerb = getRandomInt(passgen.verbs.length);
  var randomNoun = getRandomInt(passgen.nouns.length);

  return randomAdjective + "-" + randomVerb + "-" + randomNoun;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function createFirebaseUser(email, username, sender) {
  // Generate Firebase user's uid based on LINE's mid
  const firebaseUid = `line:${lineMid}`;
  admin.auth().getUserByEmail(email).catch((error) => {
    if(error.code === "auth/user-not-found") {

      var password = generatePassphrase();

      var result = admin.auth().createUser({
        uid: username,
        email: email,
        emailVerified: false,
        password: "i-love-common",
        displayName: username,
        disabled: false
      });

      return result.then((r) => { return password; });
    }

    return Promise.reject(error);
  }).then((password) => {

    var result = functions.database('/log').push().set({
      type: "invite",
      email: email,
      sender: sender,
      recipient: recipient,
      startingLife: 0
    });

    return result.then((r) => { return password; });
  }).then((password) => {

    var result = functions.database('/players/' + username).set({
      email: email,
      username: username,
      lastSeen: 0,
      invitedBy: sender,
      initialPassword: password
    });

    return result;
  }).then((result) => {

    return {success: true};

  }).catch((error) => {
    console.log("Error creating user?");
    console.log(error);
    return {
      success: false
    };
  });
}

exports.createUserAndInvite = functions.https.onCall((data, context) => {
  var result =
    createFirebaseUser(data.email, data.username, data.sender).then((result) => {
      return {success: result.success};
    });

  return result;
});

exports.sendWelcomeEmail =
  functions
    .database
    .ref('/players/{uid}').onCreate((snapshot) => {

      var user = snapshot.val();

      var password = user.initialPassword || "UNKNOWN";

      var mailOptions = {
        from: '"Common Play" <marieflanagan@gmail.com>',
        to: user.email,
        subject: "Welcome to Common!",
        text: "Welcome to Common! Your password is: " + password;
      };

      return mailTransport.sendMail(mailOptions)
        .then(() => { console.log("Successfully sent email to: " + user.email); return true;})
        .catch((error) => console.error('There was an error while sending the email to ' + user.email + ':', error));

    });
