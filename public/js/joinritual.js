var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 150;

var leftButton;
var rightButton;

var lButtonEcho
var rButtonEcho


var leftButtonX = 100;
var leftButtonY = screenH / 2;
var rightButtonX = screenW - 100;
var rightButtonY = screenH / 2;

var leftIsTouched = false;
var rightIsTouched = false;
// var fullScreenButtonIsTouched = false;

var keyF = false;
var keyJ = false;
// var keyT = false;

// var fullScreenButtonWidth = 150;
// var fullScreenButtonX = 0;
// var fullScreenButtonY = 0;

var col = 0;
var bgcol = 0;

// var magenta = 255, 0, 255;
// var cyan = 0, 255, 255;
// var blue = 9, 6, 34;

var rEllipseStroke = 2;
var lEllipseStroke = 2;

var line1 = 0;
var line2 = 0;

var lineLength1 = 0;
var lineLength2 = 0;

var haveIWonYet = false;

var titleText = 'NEW PLAYER INVITATION';
var introText = 'hold the buttons to connect';
var winText = 'connected!';

var xspacing = 1; // Distance between each horizontal location
var w; // Width of entire wave
var theta = 0; // Start angle at 0
var theta2 = 1.5; // Start angle at 0

var amplitude = 10.0; // Height of wave
var amplitude2 = 15.0; // Height of wave

var period = 300.0; // How many pixels before the wave repeats
var dx; // Value for incrementing x
var yvalues; // Using an array to store height values for the wave
var waveCircleW = 4;
var waveCircleH = 4;
var waveCircleOpacity = 70;

function setup() {
  createCanvas(screenW, screenH);
  background(0);
  w = screenW - buttonWidth;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w / xspacing));

}

function draw() {
  background(0);

  textAlign(CENTER, TOP);
  textFont("monospace");
  singleKeyDownCheck();
  keyDownCheck();

    // if (fullScreenButtonIsTouched) {
    //   var fs = fullscreen();
    //   fullscreen(!fs);
    // }

  if (haveIWonYet) {
    document.querySelector("#new-connection-sound").play()

    background(36, 32, 69);

    fill(255);
    textSize(40);
    text(winText, screenW / 2 - 240, 150, 480, 200);
    noFill();

    calcWave();
    renderWave();
    calcWave2();
    renderWave2();
    blendMode(BLEND);

    setTimeout(function() {
      window.location.href = "joinritualwin.html";
    }, 4000);

  } else {
    fill(255);

    textSize(30);
    text(titleText, screenW / 2 - 250, 150, 480, 300);
    textSize(30);
    text(introText, screenW / 2 - 250, 200, 480, 300);
    noFill();

    if (leftIsTouched || keyIsDown(70)) {
      lEllipseStroke = 5;
      fill(23,34,56)
      lButtonEcho = ellipse(leftButtonX, leftButtonY, buttonWidth+50, buttonWidth+50);
      noFill();
      noStroke();
    } else {
      lEllipseStroke = 2;
    }
    if (rightIsTouched || keyJ == true) {
      rEllipseStroke = 5;
      fill(23,34,56)
      rButtonEcho = ellipse(rightButtonX, rightButtonY, buttonWidth+50, buttonWidth+50);
      noFill();
      noStroke();
    } else {
      rEllipseStroke = 2;
    }
  }

  var distanceBetweenButtons = (rightButtonX - buttonWidth / 2) - (leftButtonX + buttonWidth / 2);

  fill(19, 16, 94);
  stroke(255, 0, 255);
  strokeWeight(lEllipseStroke);
  ellipse(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  strokeWeight(rEllipseStroke);
  ellipse(rightButtonX, rightButtonY, buttonWidth, buttonWidth);
  noFill();
  noStroke();



  if (haveIWonYet == false) {
    if (leftIsTouched && rightIsTouched || keyDownCheck()) {
      document.querySelector("#connection-forming-sound").play()
      lineLength1++;
      lineLength2--;

    } else {
      if (lineLength1 > 0 || lineLength2 < 0) {
        lineLength1--;
        lineLength2++;
      }
    }
    col = map(lineLength1, 0, distanceBetweenButtons/2, 0, 255);


    haveIWonYet = winState(distanceBetweenButtons / 2);
    stroke(255, 0, 255);
    strokeWeight(4);
    line1 = line(leftButtonX + buttonWidth / 2, leftButtonY, leftButtonX + buttonWidth / 2 + lineLength1, leftButtonY);
    line2 = line(rightButtonX - buttonWidth / 2, rightButtonY, rightButtonX - buttonWidth / 2 + lineLength2, leftButtonY);
    noStroke();
  }



  }

  function withinLeft(t) {
    return dist(t.x, t.y, leftButtonX, leftButtonY) <= buttonWidth;
  }

  function withinRight(t) {
    return dist(t.x, t.y, rightButtonX, rightButtonY) <= buttonWidth;
  }

  // function withinFullScreenButton(t) {
  //   return dist(t.x, t.y, fullScreenButtonX, fullScreenButtonY) <= buttonWidth;
  // }

  function isTouched(touches) {
    leftIsTouched = touches.reduce(leftReducer, false);
    rightIsTouched = touches.reduce(rightReducer, false);
    // fullScreenButtonIsTouched = touches.reduce(fullScreenButtonIsTouchedReducer, false);
  }

  function leftReducer(accumulator, currentValue) {
    return accumulator || withinLeft(currentValue);
  }

  function rightReducer(accumulator, currentValue) {
    return accumulator || withinRight(currentValue);
  }
  // function fullScreenButtonIsTouchedReducer(accumulator, currentValue) {
  //   return accumulator || withinFullScreenButton(currentValue);
  // }


  function singleKeyDownCheck() {
    if (keyIsDown(70)) {
      keyF = true;
    } else {
      keyF = false;
    }

    if (keyIsDown(74)) {
      keyJ = true;
    } else {
      keyJ = false;
    }
  }

  function keyDownCheck() {
    if (keyF == true && keyJ == true) {
      return true;
    } else {
      return false;
    }
  }


  function touchStarted() {
    isTouched(touches);
    return false;
  }

  function touchEnded() {
    isTouched(touches);
    return false;
  }

  function touchMoved() {
    isTouched(touches);
    return false;
  }

  function winState(distance) {
    if (lineLength1 > distance && (-1) * lineLength2 > distance) {
      return true;
      // connectionFormingSound.play();
    } else {
      // console.log("not winning yet")
      return false;
    }
  }

  // function mousePressed() {
  //   if (mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
  //     var fs = fullscreen();
  //     fullscreen(!fs);
  //   }
  // }

  function calcWave() {
    // Increment theta (try different values for
    // 'angular velocity' here
    theta += 0.02;

    // For every x value, calculate a y value with sine function
    var x = theta;
    for (var i = 0; i < yvalues.length; i++) {
      yvalues[i] = sin(x) * amplitude;
      x += dx;
    }
  }

  function calcWave2() {
    // Increment theta (try different values for
    // 'angular velocity' here
    theta += 0.03;
    // For every x value, calculate a y value with sine function
    var x = theta;
    for (var i = 0; i < yvalues.length; i++) {
      yvalues[i] = sin(x) * amplitude2;
      x += dx;
    }
  }

  function renderWave() {
    fill(255, 0, 255, waveCircleOpacity);
    // A simple way to draw the wave with an ellipse at each location
    for (var x = 30; x < yvalues.length; x++) {
      ellipse(x * xspacing, height / 2 + yvalues[x], waveCircleW, waveCircleH);
    }
  }

  function renderWave2() {
    fill(0, 255, 255, waveCircleOpacity);

    // A simple way to draw the wave with an ellipse at each location
    for (var x = 30; x < yvalues.length; x++) {
      ellipse(x * xspacing, height / 2 + yvalues[x], waveCircleW, waveCircleH);
    }
  }
