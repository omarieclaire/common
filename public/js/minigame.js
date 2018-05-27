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

var lineLength = 0;

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
    lineLength++;
  } else {
    if(lineLength > 0) {
      lineLength--;
    }
  }

  strokeWeight(4);
  // strokeColor(0);

  line(leftButtonX + buttonWidth, leftButtonY, leftButtonX + buttonWidth + lineLength, leftButtonY);
      // rightButtonBar.visible = true

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


// this prevents dragging screen around
// function touchMoved() {
//   return false;
// }


// rightBarWidth = rightBarWidth + 2


// if left bar width is greater than half of the distance between the buttons
    // One color per finger
    // fill(colors[i]);
    // Draw a circle at each finger
