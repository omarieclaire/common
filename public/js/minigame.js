var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 100;

var leftButton;
var rightButton;

var leftButtonX = 50;
var leftButtonY = screenH/2 - buttonWidth/2;
var rightButtonX = screenW - (buttonWidth + 50);
var rightButtonY = screenH/2 - buttonWidth/2;

// p1bounds = font.textBounds(message,x,y,fontsize);


var leftButtonBar;
var rightButtonBar;
var leftBarWidth = 50;
var rightBarWidth = 50;


function setup() {
  createCanvas(screenW, screenH);
  //background(200);
}

function withinXLeftBoundary(t) {
  return t.x > leftButtonX && t.x < leftButtonX + buttonWidth;
}
function withinYLeftBoundary(t) {
  return t.y > buttonY && t.y < buttonY + buttonWidth;
}
function withinXRightBoundary(t) {
  return t.x > rightButtonX && t.x < rightButtonX + buttonWidth;
}
function withinYRightBoundary(t) {
  return t.y > buttonY && t.y < buttonY + buttonWidth;
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
  // rect(leftButtonX + buttonWidth, leftButtonY + buttonWidth / 2, leftBarWidth, 50);
  // rect(rightButtonX - rightBarWidth, rightButtonY + buttonWidth /2, rightBarWidth, 50);

  // The touches array holds an object for each and every touch
  // The array length is dynamic and tied to the number of fingers
  // currently touching

  // ellipse(56, 46, 55, 55);

  //     // leftBarWidth = leftBarWidth + 2
  //   } else if ((touches[i].x > rightButtonX && touches[i].x < rightButtonX + buttonWidth)&&(touches[i].y > buttonY && touches[i].y < buttonY + buttonWidth)) {
  //     text("touched right", width/2, height/2 + 20);
  //     // rightButtonBar.visible = true
  //     // rightBarWidth = rightBarWidth + 2
  //   }
  // }
}

function touchStarted() {

  text("Number of touches: " + touches.length, 200,200);

  if(touches.length >= 2) {

    var t0 = touches[0];
    var t1 = touches[1];

    var t0WithinLeft = withinLeft(t0);
    var t0WithinRight = withinRight(t0);

    var t1WithinLeft = withinLeft(t1);
    var t1WithinRight = withinRight(t1);

    if(t0WithinLeft && t1WithinRight) {
      text("two touches", 100,100);
    } else if(t0WithinRight && t1WithinLeft) {
      text("two touches", 100,100);
    } else {
      text("how many touches: " + touches.length, 200,100);
    }
  }
  return false;
}

// function mousePressed() {
//   console.log(mouseX, mouseY);
//   if (((mouseX > leftButtonX && mouseX < leftButtonX + buttonWidth)&&(mouseY > leftButtonY && mouseY < leftButtonY + buttonWidth))&&((mouseX > rightButtonX && mouseX < rightButtonX + buttonWidth)&&(mouseY > rightButtonY && mouseY < rightButtonY + buttonWidth))) {
//     console.log("both button pressed");
//   } else if ((mouseX > leftButtonX && mouseX < leftButtonX + buttonWidth)&&(mouseY > leftButtonY && mouseY < leftButtonY + buttonWidth)) {
//     console.log("button pressed");
//     //text("two fingers", 100, 100);
//   } else if ((mouseX > rightButtonX && mouseX < rightButtonX + buttonWidth)&&(mouseY > rightButtonY && mouseY < rightButtonY + buttonWidth)) {
//     console.log("r button pressed");
//   }
// }

// this prevents dragging screen around
// function touchMoved() {
//   return false;
// }



// if left bar width is greater than half of the distance between the buttons
    // One color per finger
    // fill(colors[i]);
    // Draw a circle at each finger
