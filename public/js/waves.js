var importWaves = function() {

  var valueline = d3.line()
    .x(function (d) {
      return d.xVal;
    })
    .y(function (d) {
      return d.yVal;
    });

  function lerp (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
  }

  function wavePath(phase,x1,y1,x2,y2) {
    var xStart = x1;
    var yStart = y1;

    var xEnd = x2;
    var yEnd = y2;

    var numSamples = 50;

    var data = [];
    var amplitude = 3.0;
    var frequency = 3.0;

    for (var i = 0; i < numSamples; i++)
    {
      var progress = (i.toFixed(10) / numSamples);

      var xpos = lerp(xStart, xEnd, progress);
      var ypos = lerp(yStart, yEnd, progress);

      var xDelta = xEnd - xStart;
      var yDelta = yStart - yEnd;

      var vecLength = Math.sqrt(xDelta*xDelta + yDelta*yDelta);
      // Avoid divide by zero
      vecLength = Math.max(vecLength, 0.0001);

      var amp = amplitude * (Math.cos(progress * Math.PI * 2. + 3.14)*0.5+0.5);
      // normalize it
      xDelta = xDelta / vecLength;
      yDelta = yDelta / vecLength;

      var angle = Math.atan2(yDelta, xDelta);
      var wave = Math.sin(phase+d3.now()*0.01 + progress * Math.PI * 2.0 * frequency ) * amp;

      xpos += Math.sin(angle) * wave * 0.5;
      ypos += Math.cos(angle) * wave * 0.5;

      var entry = { xVal:xpos, yVal:ypos };

      data.push(entry);
    }
    return valueline(data);
  }

  return {
    wavePath: wavePath
  };
}
