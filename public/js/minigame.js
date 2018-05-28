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

// var player1Sound = null;
// var player2Sound = null;
// var connection-forming-sound = null;

// function preload() {
//   player1Sound = loadSound('sounds/player1-sound.mp3');
//   player2Sound = loadSound('sounds/player2-sound.mp3');
//   connectionformingsound = loadSound('sounds/connection-forming-sound.mp3');
//
// }



function setup() {
  createCanvas(screenW, screenH);
  fill(0);
  background(200);
  // player2Sound = loadSound('/sounds/player2-sound.mp3');
  // player2Sound = loadSound('/sounds/player2-sound.mp3');
  // connectionFormingSound = loadSound('/sounds/connection-forming-sound.mp3');
  // newConnectionSound = loadSound('/sounds/new-connection-sound.mp3');
}

function draw() {
  playSound("connection-forming-sound");




  if(haveIWonYet) {
    background(255, 0, 255);
    textAlign(CENTER);
    text("Success!", 200, 200);
    // document.querySelector("#reinforcing-connection-sound").play()

    // window.location.replace('minigamewin.html');

   setTimeout(function() {
   window.location.href = "minigamewin.html"; //will redirect to your blog page (an ex: blog.html)
}, 2000); //will call the function after 2 secs.

  } else {
    background(200);
    // document.querySelector("#reinforcing-connection-sound").play()

  }

  // textAlign(CENTER);

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





// function keyPressed() {
//   if (keyCode === 70 && keyCode === 74) {
//     isTouched = true;
//   } else if (keyCode === 70) {
//     leftIsTouched = true;
//     value = 0, 255, 0;
//   } else if (keyCode === 74) {
//     rightIsTouched = true;
//     value = 0, 0, 255;
//
//   }
//
// }
