var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 100;

var leftButton;
var rightButton;

var leftButtonX = 50;
var leftButtonY = screenH/2 - buttonWidth/2;
var rightButtonX = screenW - (buttonWidth + 50);
var rightButtonY = screenH/2 - buttonWidth/2;

var leftButtonBar;
var rightButtonBar;
var leftBarWidth = 10;
var rightBarWidth = 10;

var leftIsTouched = false;
var rightIsTouched = false;

var line1 = 0;
var line2 = 0;

var lineLength1 = 0;
var lineLength2 = 0;

function setup() {
  createCanvas(screenW, screenH);
  background(200);
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

function draw() {
  background(200);
  fill(0);

  textAlign(CENTER);

  rect(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  rect(rightButtonX, rightButtonY, buttonWidth, buttonWidth);
  rect(leftButtonX + buttonWidth, leftButtonY + buttonWidth/2, leftBarWidth, 10);
  rect(rightButtonX - rightBarWidth, rightButtonY + buttonWidth/2, rightBarWidth, 10);

  if(leftIsTouched && rightIsTouched) {
    lineLength1 ++;
    lineLength2 --;
  } else {
    if (lineLength1 > 0 || lineLength2 < 0) {
      lineLength1--;
      lineLength2++;
    }
  }

  strokeWeight(4);

  var distanceBetweenButtons = rightButtonX - leftButtonX - buttonWidth;

  line1 = line(leftButtonX + buttonWidth, leftButtonY, leftButtonX + buttonWidth + lineLength1, leftButtonY);
  line2 = line(rightButtonX, rightButtonY, rightButtonX + lineLength2, leftButtonY);

  // console.log(lineLength1, lineLength2);
  winState(distanceBetweenButtons / 2);

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
    console.log("win");
  } else {
    console.log("not winning yet")
  }
}

// var line1 = 0;
// var line2 = 0;
//
// var lineLength1;
// var lineLength2;

// this prevents dragging screen around
// function touchMoved() {
//   return false;
// }
