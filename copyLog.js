var admin = require('firebase-admin');

var serviceAccount = require('serviceAccountKey.json');

var cliArgs = process.argv.slice(2);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://common-d2ecf.firebaseio.com"
});

var db = admin.database();

var i = 0;

db.ref('/log2').remove().then(function() {

  process.stdout.write("Press enter to start reading the log");
  process.stdin.once("data", function(data) {
    db.ref('/log').on('child_added', function(data) {
      i++;
      setTimeout(function(j, logEntry) {
        console.log('%s. child added @ %s', j, logEntry.timestamp);
        db.ref('/log2').push().set(logEntry);
      }, 1000 + i * 100, i, data.val());
    });
  });

});
