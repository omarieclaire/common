document.addEventListener("DOMContentLoaded", function() {

  var svg = document.getElementById("svg");

  function getMousePositions(evt) {
    var CTM = svg.getScreenCTM();
    var touch = evt.touches[0];
    var positions = new Array();
    for(i = 0; i < evt.touches.length ; i++) {
      var touch = evt.touches[i];
      var pos = {
        x: (touch.clientX - CTM.e) / CTM.a,
        y: (touch.clientY - CTM.f) / CTM.d
      };
      positions.push(pos);
    }
    return positions;
  }

  function createLine() {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    circle.setAttribute("cx",200);
    circle.setAttribute("cy",150);
    circle.setAttribute("stroke","black");
    circle.setAttribute("stroke-width",3);
    circle.setAttribute("fill",none);
    circle.setAttribute("fill",none);

  }

  function insideCircle(circle, mousePosition) {
    var circleX = +circle.getAttribute("cx");
    var circleY = +circle.getAttribute("cy");
    var radius  = +circle.getAttribute("r");

    var xDiff = Math.abs(circleX - mousePosition.x);
    var yDiff = Math.abs(circleY - mousePosition.y);

    var length = Math.sqrt(xDiff*xDiff + yDiff*yDiff);

    return length <= radius;
  }

  function makeLine(length) {
    var string = "m 140 50 h " + length + " 0";
    return string;
  }

  var circleLeft = document.getElementById("circle-left");
  var circleRight = document.getElementById("circle-right");
  var path = document.getElementById("path");

  var touches = [];
  var touching = false;
  var defaultLineLength = 0;
  var lineLength = 0;

  var lastFrameTimeMs = 0;
  var maxFPS = 60;
  var delta = 0;
  var timestep = 1000 / 60;

  function handleStart(ev) {
    ev.preventDefault();

    var mousePositions = getMousePositions(ev);
    var mousePosition = mousePositions[0];

    if(insideCircle(circleLeft, mousePosition) && mousePositions.length >= 1) {
      touching = true;
    }
  };

  function handleEnd(ev) {
    ev.preventDefault();
    touching = false;
  }

  svg.addEventListener("touchstart", handleStart, false);
  svg.addEventListener("touchend", handleEnd, false);

  function mainLoop(timestamp) {
    // Throttle the frame rate.    
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
      requestAnimationFrame(mainLoop);
      return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    var numUpdateSteps = 0;
    while (delta >= timestep) {
      //update(timestep);

      if(touching) {
        lineLength = lineLength + 1;
      } else {
        if(lineLength > defaultLineLength) {
          lineLength = lineLength - 1;
        }
      }

      path.setAttribute("d", makeLine(lineLength));

      delta -= timestep;
      if (++numUpdateSteps >= 240) {
        break;
      }
    }

    requestAnimationFrame(mainLoop);
  }

  requestAnimationFrame(mainLoop);
});
