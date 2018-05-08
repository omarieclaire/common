var canvas;
var score;
var button;
var initialInput;
var submitButton;
var database;

function setup() {
  canvas = createCanvas(100, 100);
  canvas.parent('game');
  score = 0;
  createP('Click the button to get lifeforce.').parent('game');
  button = createButton('click');
  button.mousePressed(increaseScore);
  button.parent('game');
  initialInput = createInput('');
  initialInput.parent('game');
  submitButton = createButton('submit');
  submitButton.parent('game');
  submitButton.mousePressed(submitScore);

  var config = {
    apiKey: "AIzaSyAtKnQw8v9xdpSTPBZwFj3CcIjnugqIxUg",
    authDomain: "common-d2ecf.firebaseapp.com",
    databaseURL: "https://common-d2ecf.firebaseio.com",
    projectId: "common-d2ecf",
    storageBucket: "common-d2ecf.appspot.com",
    messagingSenderId: "462000767544"
  };
  firebase.initializeApp(config);
  database = firebase.database();

  var ref = database.ref('scores');
  ref.on('value', gotData, errData);
}

function gotData(data) {

  var scorelistings = selectAll('.scorelisting');
  for (var i = 0; i < scorelistings.length; i++) {
    scorelistings[i].remove();
  }

  //console.log(data.val());
  var scores = data.val();
  var keys = Object.keys(scores);
  //console.log(keys);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var initials = scores[k].initials;
    var score = scores[k].score;
    //console.log(initials, score);
    var li = createElement('li', initials + ': ' + score);
    li.class('scorelisting');
    li.parent('scorelist');
  }
}

function errData(err) {
  console.log('Error!');
  console.log(err);
}


function submitScore() {
  var data = {
    initials: initialInput.value(),
    score: score
  }
  console.log(data);
  var ref = database.ref('scores');
  var result = ref.push(data);
  console.log(result.key);
}

function increaseScore() {
  score++;
}

function draw() {
  background(0);
  textAlign(CENTER);
  textSize(32);
  fill(255);
  text(score, width / 2, height / 2);
}
