
var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 150;

var leftButton;
var rightButton;

var leftButtonX = 100;
var leftButtonY = screenH/2;
var rightButtonX = screenW - 100;
var rightButtonY = screenH/2;

var leftButtonColour = 255;
var rightButtonColour = 255;

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

function setup() {
  createCanvas(screenW, screenH);
  background(0);

}

function draw() {
  background(0);
  // fill(30);
  // ellipse(fullScreenButtonX, fullScreenButtonY, fullScreenButtonWidth, fullScreenButtonWidth);

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
    background(0, 0, 255);
    // document.querySelector("#reinforcing-connection-sound").play()
    text(winText, screenW/2 - 240, 100, 480, 200);

   setTimeout(function() {
   window.location.href = "joinritualwin.html";
    }, 2000);

  } else {
    text(introText, screenW/2 - 250, 45, 480, 300);
  }

  var distanceBetweenButtons = (rightButtonX - buttonWidth/2) - (leftButtonX + buttonWidth/2);

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
  }

  haveIWonYet = winState(distanceBetweenButtons / 2);

  stroke('rgb(0,255,0)');
  strokeWeight(10);
  line1 = line(leftButtonX + buttonWidth/2, leftButtonY, leftButtonX + buttonWidth/2 + lineLength1, leftButtonY);
  line2 = line(rightButtonX - buttonWidth/2, rightButtonY, rightButtonX - buttonWidth/2 + lineLength2, leftButtonY);
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
