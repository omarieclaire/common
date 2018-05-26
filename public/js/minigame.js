var colors;
var screenW = window.innerWidth;
var screenH = window.innerHeight;
var buttonWidth = 100;

var leftButton;
var rightButton;

var leftButtonX = 50;
var leftButtonY = screenH/2 - buttonWidth/2;
var rightButtonX = screenW - button - 50;
var rightButtonY = screenH/2 - buttonWidth/2;
var leftButtonBar;
var rightButtonBar;
var leftBarWidth = 50;
var rightBarWidth = 50;


function setup() {
  createCanvas(screenW, screenH);
  //background(200);

  // leftButton = createSprite(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  // rightButton = createSprite(rightButtonX, rightButtonY, buttonWidth, buttonWidth);
  // leftButtonBar = createSprite(leftButtonX + buttonWidth, leftButtonY+buttonWidth, 10, 5);
  // rightButtonBar = createSprite(leftButtonX, leftButtonY+buttonWidth, 10, 5);
  // leftButtonBar.visible = true;
  // rightButtonBar.visible = true;

  // An array of five colors, one for each finger
  // colors = [color(255,0,0), color(0,255,0), color(0,0,255), color(255, 255,0), color(0,255,255)];
}

function draw() {
  // background(black);

  fill(0);
  strokeWeight(2);

  textAlign(CENTER);

  rect(leftButtonX, leftButtonY, buttonWidth, buttonWidth);
  rect(rightButtonX, rightButtonY, buttonWidth, buttonWidth);
  rect(leftButtonX + buttonWidth, leftButtonY + buttonWidth / 2, leftBarWidth, 50);
  rect(rightButtonX - rightBarWidth, rightButtonY + buttonWidth /2, rightBarWidth, 50);

  // The touches array holds an object for each and every touch
  // The array length is dynamic and tied to the number of fingers
  // currently touching

  for (var i = 0; i < touches.length; i++) {
    noStroke();
    if ((touches[i].x > leftButtonX && touches[i].x < leftButtonX + buttonWidth)&&(touches[i].y > buttonY && touches[i].y < buttonY + buttonWidth)) {
      leftBarWidth = leftBarWidth + 2
    }
    if ((touches[i].x > rightButtonX && touches[i].x < rightButtonX + buttonWidth)&&(touches[i].y > buttonY && touches[i].y < buttonY + buttonWidth)) {
      rightButtonBar.visible = true
      rightBarWidth = rightBarWidth + 2

    }
    text("touched", width/2, height/2);


// if left bar width is greater than half of the distance between the buttons
    // One color per finger
    // fill(colors[i]);
    // Draw a circle at each finger
  }

}

// When the user clicks the mouse
function mousePressed() {
  // Check if mouse is inside the circle
  var d = dist(mouseX, mouseY, 360, 200);
  if (d < 100) {
    // Pick new random color values
    r = random(255);
    g = random(255);
    b = random(255);
  }
}

  // drawSprites();

// this prevents dragging screen around
function touchMoved() {
  return false;
}
