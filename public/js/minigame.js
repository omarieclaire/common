var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 100;

var leftButton;
var rightButton;

var leftButtonX = 50;
var leftButtonY = screenH/2 - buttonWidth/2;
var rightButtonX = screenW - (buttonWidth + 50);
var rightButtonY = screenH/2 - buttonWidth/2;

var leftIsTouched = false;
var rightIsTouched = false;

var line1 = 0;
var line2 = 0;

var lineLength1 = 0;
var lineLength2 = 0;

var haveIWonYet = false;

function setup() {
 // createCanvas(screenW, screenH);
  //fill(0);
  //background(200);

  //var inp = createInput('blah');
  //inp.input(myInputEvent);

  //document.getElementById("winBox").style.display = "block";
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
  /*
  if(haveIWonYet) {
    background(0, 255, 255);
   // document.getElementById("winBox").style.display = "block";

    //display a message -> button -> username and email
  } else {
    background(200);
  }

 // textAlign(CENTER);

  rect(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  rect(rightButtonX, rightButtonY, buttonWidth, buttonWidth);
  // rect(leftButtonX + buttonWidth, leftButtonY + buttonWidth/2, leftBarWidth, 10);
  // rect(rightButtonX - rightBarWidth, rightButtonY + buttonWidth/2, rightBarWidth, 10);

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

  haveIWonYet = winState(distanceBetweenButtons / 2);
*/
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

    return true;

  } else {
    //console.log("not winning yet")
    return false;

  }
}

function myInputEvent() {
  console.log('you are typing: ', this.value());
}

// this prevents dragging screen around
// function touchMoved() {
//   return false;
// }
