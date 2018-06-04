const functions = require('firebase-functions');
// Firebase Setup
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
// const gmailCredentials = require('./gmail.json');
const passgen = require('./passgen.json');
const mailgunApiKey = require('./mailgun.json').apiKey;
const mailgun = require('mailgun-js')({apiKey: mailgunApiKey, domain: "mail.commonplay.ca"});

const nodemailer = require('nodemailer');
// const mailTransport = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: gmailCredentials.email,
//     pass: gmailCredentials.password,
//   },
// });

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generatePassphrase() {
  var randomAdjective = getRandomInt(passgen.adjectives.length);
  var randomVerb = getRandomInt(passgen.verbs.length);
  var randomNoun = getRandomInt(passgen.nouns.length);

  var adj = passgen.adjectives[randomAdjective];
  var verb = passgen.verbs[randomVerb];
  var noun = passgen.nouns[randomNoun];

  return adj + verb + noun;
}

try {
    admin.initializeApp();
} catch(error) {
    //TODO: ignoring until firebase-functions fix released
}

/**
 * Once a user object is either created or returned
 * we push an invite to the log.
 */
function authenticatedUserHandler(email, sender, username, password) {

  return admin.database().ref('/players/' + username).set({
    email: email,
    username: username,
    lastSeen: 0,
    invitedBy: sender,
    initialPassword: password
  }).then((x) => {
    console.log("successfully created player " + username);
    return admin.database().ref('/log').push().set({
      type: "invite",
      email: email,
      sender: sender,
      recipient: username,
      startingLife: 100
    });
  }).then((previous) => {
    console.log("successfully pushed to log");
    return true;
  });
}

function createFirebaseUser(email, username, sender) {

  var password = generatePassphrase();

  var promise = admin.auth().getUserByEmail(email).then((user) => {
    // The user already exists
    console.log("getUserByEmail(" + email + "): user already exists");
    console.log(user);

    return {username: user.displayName, pass: null};
  }, (error) => {
    if(error.code === "auth/user-not-found") {

      console.log("User at " + email + " was not found")

      // Create the user and then add them to the /players log
      return admin.auth().createUser({
        //uid: username,
        email: email,
        emailVerified: false,
        password: password,
        displayName: username,
        disabled: false
      }).then((user) => {
        console.log("successfully created user " + username);
        return { username: user.displayName, pass: password };
      });
    }
    console.log("Error fetching user");
    console.log(error);
    return Promise.reject(error);
  }).then((result) => {
    return authenticatedUserHandler(email, sender, result.username, result.pass);
  }).then((result) => {
    console.log("SUCCESS");
    return {success: true};
  }).catch((error) => {
    console.log("FAILURE");
    return {success: false};
  });

  return promise;
}

exports.createUserAndInvite = functions.https.onCall((data, context) => {
  var result =
    createFirebaseUser(data.email, data.username, data.sender)

  return result.then((result) => {
    return {success: result.success};
  },((error) => {
    return {success: false};
  }));

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
        bcc: 'marieflanagan@gmail.com',
        subject: "Welcome to Common!",
        text: "Hello " + user.username + "! Welcome to Common. Your password is: " + password + ' . Try logging in at https://commonplay.ca/ to get started.',
        html: "<!DOCTYPE html><html><body><p>Hello <strong>" + user.username + "</strong>!</p><p>Welcome to Common. Your password is: <code>" + password + '</code>. Try logging in at <a href="https://commonplay.ca/" target="_blank">https://commonplay.ca/</a> to get started.</p></body></html>'
      };

      var mailgunPromise = new Promise((resolve, reject) => {
        mailgun.messages().send(mailOptions, ((error, body) => {
          if(error) {
            reject(error);
          } else {
            resolve(body);
          }
        }));
      });

      return mailgunPromise.then((resp) => {
        return admin.database().ref('/players/' + user.username).update({
          initialPassword: null
        });
      });

    });

exports.emailExists = functions.https.onCall((email) => {

  var promise = admin.auth().getUserByEmail(email).then((user) => {
    return Promise.resolve(true);
  }, (error) => {
    if(error.code === "auth/user-not-found") {
      return Promise.resolve(false);
    } else {
      return Promise.reject(new Error("error fetching email"));
    }
  });

  return promise;

});
