
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

var keyF = false;
var keyJ = false;

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

  textAlign(CENTER, TOP);
  // strokeWeight(0);
  textFont("monospace");
  textSize(40);
  fill(255);

singleKeyDownCheck();
keyDownCheck();

  if(haveIWonYet) {
    background(0, 0, 255);
    // text(winText, screenW/2 - 240, 20, 480, 50);
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


  // console.log(lineLength1, lineLength2);
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

function leftReducer(accumulator, currentValue) {
  return accumulator || withinLeft(currentValue);
}
function rightReducer(accumulator, currentValue) {
  return accumulator || withinRight(currentValue);
}



function isTouched(touches) {
  leftIsTouched = touches.reduce(leftReducer, false);
  rightIsTouched = touches.reduce(rightReducer, false);
}



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
    // leftIsTouched = touches.reduce(leftReducer, false);
    // rightIsTouched = touches.reduce(rightReducer, false);
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
