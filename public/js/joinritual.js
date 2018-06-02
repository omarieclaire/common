
var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 100;

var leftButton;
var rightButton;

var leftButtonX = 75;
var leftButtonY = screenH/2 - buttonWidth/2;
var rightButtonX = screenW - (buttonWidth + 75);
var rightButtonY = screenH/2 - buttonWidth/2;

var leftIsTouched = false;
var rightIsTouched = false;

var line1 = 0;
var line2 = 0;

var lineLength1 = 0;
var lineLength2 = 0;

var haveIWonYet = false;

var introText = 'New player invitation! Hold the buttons below to connect';
var winText = 'Connection made'

function setup() {
  createCanvas(screenW, screenH);
  fill(0);
  background(200);
}

function draw() {
  textAlign(CENTER, TOP);
  // textLeading(leading)

  strokeWeight(2);
  // fill(255);
  textFont("monospace");
  textSize(30);

  fill(50);

  if(haveIWonYet) {
    background(0, 255, 255);
    text(winText, screenW/2 - 240, 20, 480, 300);
    // document.querySelector("#reinforcing-connection-sound").play()

   setTimeout(function() {
   window.location.href = "joinritualwin.html";
    }, 2000);

  } else {
    text(introText, screenW/2 - 250, 20, 500, 300);



    //background(200);
  }

  rect(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  rect(rightButtonX, rightButtonY, buttonWidth, buttonWidth);

  if (haveIWonYet == false) {
    if(leftIsTouched && rightIsTouched) {

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

  strokeWeight(10);

  var distanceBetweenButtons = rightButtonX - leftButtonX - buttonWidth;

  line1 = line(leftButtonX + buttonWidth, leftButtonY + buttonWidth/2, leftButtonX + buttonWidth + lineLength1, leftButtonY + buttonWidth/2);
  line2 = line(rightButtonX, rightButtonY + buttonWidth/2, rightButtonX + lineLength2, leftButtonY + buttonWidth/2);

  // console.log(lineLength1, lineLength2);
  haveIWonYet = winState(distanceBetweenButtons / 2);

}

function withinXLeftBoundary(t) {
  return t.x > leftButtonX && t.x < leftButtonX + buttonWidth;
}
function withinYLeftBoundary(t) {
  return t.y > leftButtonY && t.y < leftButtonY + buttonWidth;
}
function withinXRightBoundary(t) {
  return t.x > rightButtonX && t.x < rightButtonX + buttonWidth;
}
function withinYRightBoundary(t) {
  return t.y > rightButtonY && t.y < rightButtonY + buttonWidth;
}
function withinLeft(t) {
  return withinXLeftBoundary(t) && withinYLeftBoundary(t);
}
function withinRight(t) {
  return withinXRightBoundary(t) && withinYRightBoundary(t);
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
