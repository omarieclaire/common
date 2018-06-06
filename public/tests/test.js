document.addEventListener("DOMContentLoaded", function() {

  var scores = importScores();
  var util = importUtil(scores);

  var mockFirebase = {
    database: function() { console.log("database"); }
  };

  var db = importDb(util, mockFirebase, scores);

  function parseFileName(file) {
    return file.split("/").slice(3).join("/");
  }

  function assert(bool, msg) {
    if(!bool) {
      throw new Error(msg);
    }
  }

  function parseStack(stack) {
    var result = stack.split('\n').map(function(line) {
      return parseFileName(line.trim());
    });
    result.splice(-1,1);

    return result;
  }

  function createColorSpan(color, msg) {
    var span = document.createElement("span");
    span.setAttribute("style", "color: " + color + ";");
    var text = document.createTextNode(msg);
    span.appendChild(text);
    return span;
  }

  function runTest(test, args) {
    var anchor = document.getElementById("tests");
    var li = document.createElement("li");
    var nameNode = document.createTextNode(test.name + ": ");

    li.appendChild(nameNode);

    try {
      test(args);
      li.appendChild(createColorSpan("green", "PASSED"));
    } catch(error) {
      var nestedUl = document.createElement("ul");
      var nestedLis = parseStack(error.stack).map(function(stackLine) {
        var li = document.createElement("li");
          li.innerHTML = stackLine;
        return li;
      });
      nestedLis.forEach(function(li) {
        nestedUl.appendChild(li);
      });
      li.appendChild(createColorSpan("red", "FAILED"));
      li.appendChild(nestedUl);
    }

    anchor.appendChild(li);

  }

  function initializeState() {
    return {
      // index used by random button
      randomIndex: 1,
      // id of the current user (same as ME)
      selfId: "test-user",
      // color picker
      colorPicker: d3.scaleOrdinal(["#47ade0", "#be73e6", "#86e570", "#e466be", "#62b134", "#738ae8", "#db8f2e", "#4be0d9", "#ee5679", "#6de8a6",
        "#ea6941", "#54b385", "#e07aa0", "#5dad5c", "#c792d6", "#90a44a", "#dc8869", "#cfe48c", "#caa74e"
      ]),
      // directory of known players
      players: {},
      // set of nodes/edges we have already seen (objects)
      seenNodes: {},
      seenEdges: {},
      // list of node/edge data used by the force-directed graph
      nodes: [],
      edges: [],
      // method used to draw the graph. For initialization reasons
      // we start with a fake draw and mutate it below.
      draw: function() { console.log("fake draw"); },
      // id of the leg entry for this version of the state.
      logEntry: null
    };
  }

  function testAddEdge() {
    var state = initializeState();
    util.addEdge("test-user", "other-user", state);
    var edge = state.seenEdges[util.edgeId("test-user", "other-user")];
    assert(state.edges.length === 1);
    assert(state.nodes.length === 2);

    util.deleteEdge(edge, state);

    console.assert(state.edges.length === 0);
    assert(state.nodes.length === 2);
  }

  function testTrackClickDecrementsClick() {
    var state = initializeState();
    var nodeWithSixClicks = util.addNode("test-user-6", state, 100, 6);
    var msg = {
      sender: "test-user-6",
      timestamp: 123
    };
    db.trackClick(state, msg)
    assert(nodeWithSixClicks.clicks === 5, "Node should have five clicks");

    var nodeWithZeroClicks = util.addNode("test-user-0", state, 100, 0);
    var msg = {
      sender: "test-user-0",
      timestamp: 124
    };
    db.trackClick(state, msg)
    assert(nodeWithZeroClicks.clicks === 0, "Node should have zero clicks");

  }

  runTest(testAddEdge);
  runTest(testTrackClickDecrementsClick);
});


