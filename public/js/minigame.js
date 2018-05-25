// //mouse states and mouse events on sprites
// //click and hold the mouse button while overing on the sprites

// var asterisk;
// var ghost;
// var ghostBar;

// function setup() {
//   createCanvas(800,400);

//   ghost = createSprite(200, 200);
//   ghost.addAnimation("normal", "img/ghost_spin0001.png",  "img/ghost_spin0003.png");
//   //detect the mouse position and click on this sprite
//   //if no collider is defined, the image bounding box will be checked
//   ghost.mouseActive = true;

//   asterisk = createSprite(600, 200);
//   asterisk.addAnimation("normal", "img/asterisk_normal0001.png", "img/asterisk_normal0003.png");
//   asterisk.addAnimation("stretch", "img/asterisk_stretching0001.png", "img/asterisk_stretching0008.png");
//   var anim = asterisk.addAnimation("transform", "img/asterisk_circle0001.png", "img/asterisk_circle0008.png");

//   //if defined, the collider will be used for mouse events
//   asterisk.setCollider("circle", 0,0,64);
//     ghost.setCollider("circle", 0, 0, 64);
//   //I can assign functions to be called upon specific mouse events
//   //within the function "this" will reference the sprite that triggered the event
//   asterisk.onMouseOver = function() {
//   this.changeAnimation("stretch");
//   }

//   asterisk.onMouseOut = function() {
//   this.changeAnimation("normal");
//   }

//   asterisk.onMousePressed = function() {
//   this.changeAnimation("transform");
//   this.animation.goToFrame(this.animation.getLastFrame());
//   }

//   asterisk.onMouseReleased = function() {
//   this.changeAnimation("transform");
//   this.animation.goToFrame(0);
//   }

//     ghostBar = createSprite(200, 200, 10, 50)
//     //ghostBar.addImage("img/asterisk_normal0001.png")
//     ghostBar.grow = false
//     ghostBar.visible = false
//     ghost.onMousePressed = function() {
//         ghostBar.visible = true
//         ghostBar.grow = true
//     }

//     ghost.onMouseReleased = function() {
//         ghostBar.visible = false
//         ghostBar.grow = false
//     }

// }

// function draw() {
//   background(255,255,255);

//   //if a sprite is mouseActive true I can check if the mouse is over its collider
//   //and if the button is pressed
//   if(ghost.mouseIsOver)
//       ghost.rotation-= 10;

//     //  ghost.visible = !ghost.mouseIsPressed;
//     if(ghostBar.grow)
//         ghostBar.width += 10

//   drawSprites();
// }

var spr;


function setup(){
  createCanvas(640, 480)
}

function draw() {
  background(255)
    fill(0)
    text("load", 25, 10);
  for (var i=0; i<touches.length; i++) {
    ellipse(touches[i].x,touches[i].y,80,80)
      ellipse(mouseX, mouseY,80,80)
      text("touch = " + touches[i].x + " " + touches[i].y, 25, 25);
  }

  drawSprites();

}

function touchStarted() {
// you can leave this empty
}


//create sprite (link between players)

  spr = createSprite(
    width/2, height/2, 40, 40);
  spr.shapeColor = color(255);
  spr.velocity.y = 0.5;
}

function mousePressed() {
  spr.position.x = mouseX;
  spr.position.y = mouseY;
}
