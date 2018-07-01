const logJson = require('common-d2ecf-log-export.json');

var admin = require('firebase-admin');

var serviceAccount = require('serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://common-d2ecf.firebaseio.com"
});

var db = admin.database();

db.ref('/log2').remove().then(function() {
  var keys = Object.keys(logJson).sort();
  for(var i = 0 ; i < keys.length ; i++) {
    console.log("i = %s", i);
    var key = keys[i];
    var logEntry = logJson[key];
    setTimeout(function(j, key, logEntry) {
      db.ref('/log2').push().set(logEntry);
      console.log('i = %s: key = %s // value = %s', j, key, logEntry.timestamp);
    }, 1000 + i * 100, i, key, logEntry);
  }
});
