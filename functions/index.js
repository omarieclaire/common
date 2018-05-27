const functions = require('firebase-functions');
// Firebase Setup
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const gmailCredentials = require('./gmail.json');
const passgen = require('./passgen.json');
const mailgunApiKey = require('./mailgun.json').apiKey;
const mailgun = require('mailgun-js')({apiKey: mailgunApiKey, domain: "mail.commonplay.ca"});

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

try {
    admin.initializeApp();
} catch(error) {
    //TODO: ignoring until firebase-functions fix released
}

function createFirebaseUser(email, username, sender) {
  admin.auth().getUserByEmail(email).catch((error) => {
    if(error.code === "auth/user-not-found") {

      var password = generatePassphrase();

      var result = admin.auth().createUser({
        //uid: username,
        email: email,
        emailVerified: false,
        password: password,
        displayName: username,
        disabled: false
      });

      return result.then((r) => { return password; });
    }

    return Promise.reject(error);
  }).then((password) => {

    var result = admin.database().ref('/log').push().set({
      type: "invite",
      email: email,
      sender: sender,
      recipient: username,
      startingLife: 0
    });

    return result.then((r) => { return password; });
  }).then((password) => {

    var result = admin.database().ref('/players/' + username).set({
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
        from: 'Common Play <play@mail.commonplay.ca>',
        to: user.email,
        subject: "Welcome to Common!",
        text: "Welcome to Common! Your password is: " + password
      };

      var result = new Promise((resolve, reject) => {
        mailgun.messages().send(mailOptions, ((error, body) => {
          if(error) {
            reject(error);
          } else {
            resolve(body);
          }
        }));
      });

      return result;
    });
