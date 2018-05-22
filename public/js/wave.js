.axis path, .axis line {
    fill: none;
    shape-rendering: crispEdges;
    stroke: #BBB;
    stroke-width: 1;
}

.axis text {
    fill: #766;
    font-family: 'PT Sans Narrow', sans-serif;
    font-size: 12px;
}
</style>

<script>
function lerp (value1, value2, amount) {
	amount = amount < 0 ? 0 : amount;
	amount = amount > 1 ? 1 : amount;
	return value1 + (value2 - value1) * amount;
}

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    angles = d3.range(0, 2 * Math.PI, Math.PI / 200);

var xStart = width/4;
var yStart = height/2;

var xEnd = width/4;
var yEnd = 1.;

var numSamples = 100;

var valueline = d3.line()
    .x(function (d) {
        return d.xVal;
    })
    .y(function (d) {
        return d.yVal;
    });

var data = [];
var amplitude = height/16.0;
var frequency = 2.0;
for (var i = 0; i < numSamples; i++)
  {
    var progress = (i.toFixed(10) / numSamples);

    var xpos = lerp(xStart, xEnd, progress);// progress * width;
    var ypos = lerp(yStart, yEnd, progress);// height/2.0 + Math.sin(progress * Math.PI * 2.0 * frequency ) * amplitude;

    var xDelta = xEnd - xStart;
    var yDelta = yStart - yEnd;

    var vecLength = Math.sqrt(xDelta*xDelta + yDelta*yDelta);

    // normalize it
    xDelta = xDelta / vecLength;
    yDelta = yDelta / vecLength;

    var angle = Math.atan2(yDelta, xDelta);
    var wave = Math.sin(progress * Math.PI * 2.0 * frequency ) * amplitude;

    xpos += Math.sin(angle) * wave * 0.5; //perpendicularVecX * wave*0.5;
    ypos += Math.cos(angle) * wave * 0.5; //perpendicularVecY * wave*0.5;

    var entry = { xVal:xpos, yVal:ypos };
    data.push(entry);
  }

svg.append("path") // Add the valueline path.
    .attr("d", valueline(data));
