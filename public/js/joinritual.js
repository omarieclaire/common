
var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 150;

var leftButton;
var rightButton;

var leftButtonX = 100;
var leftButtonY = screenH/2;
var rightButtonX = screenW - 100;
var rightButtonY = screenH/2;

// var magenta = (255,0,255);
// var cyan = (0,255,255);

var leftIsTouched = false;
var rightIsTouched = false;
// var fullScreenButtonIsTouched = false;

var keyF = false;
var keyJ = false;
// var keyT = false;

// var fullScreenButtonWidth = 150;
// var fullScreenButtonX = 0;
// var fullScreenButtonY = 0;

var line1 = 0;
var line2 = 0;

var lineLength1 = 0;
var lineLength2 = 0;

var haveIWonYet = false;

var introText = 'New player invitation: hold the buttons below to connect';
var winText = 'connected!'

var xspacing = 1;    // Distance between each horizontal location
var w;                // Width of entire wave
var theta = 0;      // Start angle at 0
var theta2 = 1.5;      // Start angle at 0

var amplitude = 10.0; // Height of wave
var amplitude2 = 15.0; // Height of wave

var period = 300.0;   // How many pixels before the wave repeats
var dx;               // Value for incrementing x
var yvalues;  // Using an array to store height values for the wave
var waveCircleW = 4;
var waveCircleH = 4;
var waveCircleOpacity = 70;

function setup() {
  createCanvas(screenW, screenH);
  background(0);
  w = screenW - buttonWidth;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w/xspacing));

}

function draw() {
  background(0);
  // fill(30);
  // ellipse(fullScreenButtonX, fullScreenButtonY, fullScreenButtonWidth, fullScreenButtonWidth);
  // blendMode(MULTIPLY);

  calcWave();
  renderWave();
  calcWave2();
  renderWave2();
  blendMode(BLEND);



  textAlign(CENTER, TOP);
  // strokeWeight(0);
  textFont("monospace");
  textSize(40);
  fill(255);

  singleKeyDownCheck();
  keyDownCheck();

  // if (fullScreenButtonIsTouched) {
  //   var fs = fullscreen();
  //   fullscreen(!fs);
  // }

  if(haveIWonYet) {
    // document.querySelector("#reinforcing-connection-sound").play()
    background(36, 32, 69);
    text(winText, screenW/2 - 240, 100, 480, 200);
    strokeWeight(1);
    calcWave();
    renderWave();
    calcWave2();
    renderWave();

   setTimeout(function() {
   window.location.href = "joinritualwin.html";
 }, 4000);

  } else {
    text(introText, screenW/2 - 250, 45, 480, 300);
  }

  var distanceBetweenButtons = (rightButtonX - buttonWidth/2) - (leftButtonX + buttonWidth/2);
  fill(255);
  ellipse(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  ellipse(rightButtonX, rightButtonY, buttonWidth, buttonWidth);

  if (haveIWonYet == false) {
    if(leftIsTouched && rightIsTouched || keyDownCheck()) {

      // connectionFormingSound.play();
      lineLength1 ++;
      lineLength2 --;

    } else {
      if (lineLength1 > 0 || lineLength2 < 0) {
        lineLength1--;
        lineLength2++;
      }
    }

    haveIWonYet = winState(distanceBetweenButtons / 2);
    stroke('rgb(0,255,0)');
    strokeWeight(10);
    line1 = line(leftButtonX + buttonWidth/2, leftButtonY, leftButtonX + buttonWidth/2 + lineLength1, leftButtonY);
    line2 = line(rightButtonX - buttonWidth/2, rightButtonY, rightButtonX - buttonWidth/2 + lineLength2, leftButtonY);

  }


 stroke(255);
  strokeWeight(0);
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
  if (lineLength1 > distance && (-1)*lineLength2 > distance) {
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
    yvalues[i] = sin(x)*amplitude;
    x+=dx;
  }
}

function calcWave2() {
  // Increment theta (try different values for
  // 'angular velocity' here
  theta += 0.03;

  // For every x value, calculate a y value with sine function
  var x = theta;
  for (var i = 0; i < yvalues.length; i++) {
    yvalues[i] = sin(x)*amplitude2;
    x+=dx;
  }
}

// function calcWave2() {
//   // Increment theta (try different values for
//   // 'angular velocity' here
//   theta += 0.03;
//
//   // For every x value, calculate a y value with sine function
//   var x = theta;
//   for (var i = 0; i < yvalues.length; i++) {
//     yvalues[i] = sin(x)*amplitude;
//     x+=dx;
//   }
// }

// function calcWave2(numPoints, theta, amplitude, period, xspacing) {
//   var points = [];
//   var x = theta;
//   for(var i = 0; i < numPoints; i++) {
//     points.push(sin(x) * amplitude);
//     x +=  (TWO_PI / period) * xspacing;
//   }
//   return points;
// }

function renderWave() {
  fill(255, 0, 255, waveCircleOpacity);
  // A simple way to draw the wave with an ellipse at each location
  for (var x = 30; x < yvalues.length; x++) {
    ellipse(x*xspacing, height/2+yvalues[x], waveCircleW, waveCircleH);
  }
}

function renderWave2() {
  fill(0, 255, 255, waveCircleOpacity);


  // A simple way to draw the wave with an ellipse at each location
  for (var x = 30; x < yvalues.length; x++) {
    ellipse(x*xspacing, height/2+yvalues[x], waveCircleW, waveCircleH);
  }
}

// function renderWave2(points, height, xspacing) {
//   // noStroke();
//   fill(0,255,0);
//   for(var x = 30; x < points.length; x++) {
//     ellipse(x*xspacing, height/2+points[x], 5,5);
//   }
// }
