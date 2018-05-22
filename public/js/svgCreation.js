// this is the svg canvas to draw onto
var chart = document.getElementById("chart");
var svg = d3.select(chart).append("svg");
var svgWidth = 0;
var svgHeight = 0;

      function redraw(){

        // Extract the width and height that was computed by CSS.
        var width = chart.clientWidth;
        var height = chart.clientHeight;

        // Use the extracted size to set the size of an SVG element.
        svg
          .attr("width", width)
          .attr("height", height);

          svgWidth = +svg.attr("width");
          svgHeight = +svg.attr("height");
        }


// attributes of the svg canvas as variables
// var svgWidth = +svg.attr("width");
// var svgHeight = +svg.attr("height");
// console.log(svgWidth);

// Draw for the first time to initialize.
      redraw();

      // Redraw based on the new size whenever the browser window is resized.
      window.addEventListener("resize", redraw);
