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
  fill(0);
  strokeWeight(2);

  textAlign(CENTER);

  rect(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  rect(rightButtonX, rightButtonY, buttonWidth, buttonWidth);
  rect(leftButtonX + buttonWidth, leftButtonY + buttonWidth/2, leftBarWidth, 10);
  rect(rightButtonX - rightBarWidth, rightButtonY + buttonWidth/2, rightBarWidth, 10);

      // rightButtonBar.visible = true
}

function touchStarted() {
  if(touches.length >= 1) {
    var t0 = touches[0];
    var t0WithinLeft = withinLeft(t0);
    var t0WithinRight = withinRight(t0);

    if (t0WithinRight) {
      console.log("t0WithinRight is touching")
    } else if (t0WithinLeft) {
      console.log("t0WithinLeft is touching")
    }

    if(touches.length >= 2) {
      var t1 = touches[1];
      var t1WithinLeft = withinLeft(t1);
      var t1WithinRight = withinRight(t1);

      if(t0WithinLeft && t1WithinRight) {
        console.log("two things are touching - 0WithinLeft && t1WithinRight")
        // text("two touches", 100,100);
      } else if(t0WithinRight && t1WithinLeft) {
        console.log("two things are touching - t0WithinRight && t1WithinLeft ")
        // text("two touches", 100,100);
      } else if (t1WithinRight) {
        console.log("t1WithinRight is touching")
      } else if (t1WithinLeft) {
        console.log("t1WithinLeft is touching")
      } else {
        console.log("I'm here to take up space")
        // text("how many touches: " + touches.length, 200,100);
      }
    }
  return false;
  }
}

// function touchEnded() {
//   console.log("touch ended")
//  }
//
//  function touchStarted() {
//    console.log("touch started")
//
//  }

// this prevents dragging screen around
// function touchMoved() {
//   return false;
// }


// rightBarWidth = rightBarWidth + 2


// if left bar width is greater than half of the distance between the buttons
    // One color per finger
    // fill(colors[i]);
    // Draw a circle at each finger
