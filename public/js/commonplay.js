/* global d3:false :false */
/* global firebase:false :false */

// when the window is ready, call the function below
window.addEventListener("load", function() {

  // Don't start the app until we have the user object.
  // If we need to optimize start time, moving this
  // around might help.
  firebase.auth().onAuthStateChanged(function(user) {

    // IMPORT
    // Note: firebase is in scope from /__/firebase/init.js
    var ui = importUi();
    var scores = importScores(ui);
    var util = importUtil(scores, ui);
    var db = importDb(util, firebase, scores);
    var action = importAction(ui, util, scores, db);

    // Create modals
    ui.createModals();

    // If the user was logged in, we set `currentUser` in local storage.
    // Note: if the user logs out, we should unset this.
    var currentUser;
    if (user === null || user === undefined) {
      currentUser = {
        email: "unknown@null.void",
        username: "anonymous-" + Date.now()
      };
    } else {
      currentUser = {
        email: user.email,
        username: user.displayName
      };
    }

    console.log("current user is: ");
    console.log(currentUser.username);
    console.log(currentUser.email);

    var initialState = {
      // index used by random button
      randomIndex: 1,
      // tracks if we are done loading yet (true) or not (false)
      loaded: false,
      // id of the current user (same as ME)
      selfId: currentUser.username,
      // reference to SVG node and info
      svg: svg,
      svgWidth: svgWidth,
      svgHeight: svgHeight,
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
      draw: function() { console.log('fake draw'); },
      // id of the leg entry for this version of the state.
      logEntry: null
    };

    // We pass the initial state, and a
    // "gameInitializer" function.
    db.initLog(initialState,function(state) {

      // create a d3 simulation object
      var simulation = d3.forceSimulation(state.nodes)
      //for making elements attract or repel one another
        .force("charge", d3.forceManyBody().strength(-500))
      //for creating a fixed distance between connected elements
        .force("link", d3.forceLink(state.edges).distance(1))
      //for setting the center of gravity of the system
        .force("center", d3.forceCenter())
      //for preventing elements overlapping
        .force("collide", d3.forceCollide(40))
      //for attracting elements to a given point
        .force("x", d3.forceX())
      //for attracting elements to a given point
        .force("y", d3.forceY())
        .alphaTarget(0.0)
        .on("tick", ticked);

      // create a <g> element and append it into <svg>
      //create the graph itself
      var g = svg
        .append("g");

      // create a <g> element for edges, append it to the previous g
      var edge = g
        .append("g")
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .selectAll(".edge");

      // create a <g> element for labels, append it to the first g
      var label = g
        .append("g")
        .attr("class", "nodeLabelContainer")
        .selectAll(".label");

      // create a <g> element for annotations, append it to the first g
      var annotationAnchor = g
        .append("g")
        .attr("class", "annotationBox")
        .selectAll(".anchor");

      // create a <g> element for nodes, append it to the first g
      var node = g
        .append("g")
        .attr("id", "g-node")
        .selectAll(".node");

      // get the nodecount HTML node
      var nc = document.getElementById("nodecount");
      // get the edgecount HTML node
      var ec = document.getElementById("edgecount");

      // small helper function to claculate all enclosed circles
      // assumes nodesByNetwork is map (key-value pairs) of
      // key=netowrk-id
      // value=nodes in network-id
      function enclosedCirclesByNetwork(nodesByNetwork) {
        var enclosedCircles = [];
        Object.keys(nodesByNetwork).forEach(function(network, index) {
          var networkData = nodesByNetwork[network];
          var nodesInNetwork = networkData.nodes;
          var networkScore = networkData.score;
          var enclosedCircle = d3.packEnclose(nodesInNetwork);
          enclosedCircle.id = "enclosing-network-" + index;
          enclosedCircle.score = networkScore;
          enclosedCircles.push(enclosedCircle);
        });
        return enclosedCircles;
      }

      // extremely side-effecty function
      function doAnnotations(enclosedCircles, annotationAnchor) {
        var annotations = enclosedCircles.map(function(circle, index) {
          return {
            id: "annotation-" + index,
            note: {
              label: "Common Life Force",
              title: circle.score || ":(",
              wrap: 400
            },
            dy: -(circle.r + 30) - 10,
            dx: 0,
            x: circle.x,
            y: circle.y,
            type: d3.annotationCalloutCircle,
            subject: {
              radius: circle.r + 20,
              radiusPadding: 20
            }
          };
        });

        annotationAnchor = annotationAnchor.data(annotations, function(d) {
          return d.id;
        });
        annotationAnchor.exit().remove();

        var makeAnnotations = d3.annotation().annotations(annotations).accessors({
          x: function x(d) {
            return d.x;
          },
          y: function y(d) {
            return d.y;
          }
        });

        annotationAnchor.enter().call(makeAnnotations);
      }

      //getting the strength of an edge by its id
      function edgeStrength(d) {
        return d.strength;
      }


      // render the score for the first time
      ui.renderMyScore(state.selfId, state.seenNodes);

      // function to refresh d3 (for any changes to the graph)?
      function draw() {
        // Apply the update to the nodes.
        // get nodes array, extract ids, and draw them
        node = node.data(state.nodes, function(d) {
          return d.id;
        });
        // exit and remove before redrawing?
        node.exit().remove();
        // redraw the nodes
        //enter is a d3 method being called on node
        //whatever this process returns: append is called on it
        node = node.enter()
          .append("circle")
        //fill takes a color but instead of giving a color I give it
        // an anon function that returns a color
          .attr("fill", function(d) {
            return d.color;
          })
          .attr("r", function(d) {
            return d.score;
          })
          .attr("stroke", "pink")
        // add an id attribute to each node, so we can access/select it later
          .attr("id", util.nodeIdAttr)
          .attr("class", function(d) {

            var classString = "";
            if(d.score > 4) {
              classString += "nodeStrong ";
            }
            if(d.score > 3) {
              classString += "nodeMedium ";
            }
            if(d.score > 2) {
              classString += "nodeSmall ";
            }
            if(d.score > 1) {
              classString += "nodeTiny ";
            }

            if(d.id === state.selfId) {
              classString += "myNode nodeClass";
              return classString;
            } else {
              classString += "nodeClass";
              return classString;
            }
          })
        //we added the onclick to the circle, but maybe we should have added it to the node
        //.on("click", nodeClick)
          .on("click", function(d) {
            action.nodeClicked(state, d);
          })
        //what does this mean?
          .merge(node);

        // In order to draw circles around each network, we calculate
        // the network scores. Then we mutate each node by adding
        // the network it belongs to.
        // Then we group each node by the network it belngs to
        // Then we use that group and d3.packEnclose to encircle the networks.
        // TODO it would be good to find a better place to calculate this stuff
        // rather than in draw
        var networkScores = scores.calculateNetworkScoresByNode(state.edges, state.nodes);
        // add a radius to the data
        node.data().forEach(function(d) {
          // This is slow; TODO we should improve this.
          networkScores.forEach(function(network) {
            if (network.people.indexOf(d.id) != -1) {
              d.network = network.network;
              d.networkScore = network.score;
            }
          });
        });

        var nodesByNetwork = util.nodesByNetwork(node.data());
        var enclosedCircles = enclosedCirclesByNetwork(nodesByNetwork);

        //add Common encirling
        doAnnotations(enclosedCircles, annotationAnchor);

        // do the same thing for the labels
        label = label.data(state.nodes, function(d) {
          return d.id;
        });
        label.exit().remove();
        label = label.enter()
          .append("text")
          .attr("class", "nodeLabel")
          .text(function(d) {
            return d.id;
          })
          .merge(label);

        // do the same thing for the edges
        edge = edge.data(state.edges, function(d) {
          return d.source.id + "-" + d.target.id;
        });
        edge.exit().remove();
        //before .merge is where I can add the viz representation of the stroke/edge
        edge = edge.enter()
          .append("line")
          .attr("stroke-width", edgeStrength)
          .attr("id", util.edgeIdAttr)
          .merge(edge);

        // Update and restart the simulation.
        simulation.nodes(state.nodes);
        simulation.force("link").links(state.edges);
        simulation.alpha(1).restart();

        // update the node and edge counts
        // can we instead call nodes.length and edges.length?
        nc.textContent = Object.keys(state.seenNodes).length;
        ec.textContent = Object.keys(state.seenEdges).length;
      }

      // Update the draw on state once we've defined it
      // (doing this for initialization reasons)
      state.draw = draw;

      // function called on every "tick" of d3 like a clock or gameloop
      function ticked(e) {
        node
        //cx is the relative position of the node
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          })
          .attr("r", function(d) {
            return 10;
            // return d.score;
          })
          .attr("fill", function(d) {
            return d.color;
          });

        edge
          .attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          })
          .attr("stroke-width", edgeStrength);

        label
          .attr("x", function(d) {
            return d.x + 9;
          })
          .attr("y", function(d) {
            return d.y - 4;
          });

        var nodesByNetwork = util.nodesByNetwork(node.data());
        var enclosedCircles = enclosedCirclesByNetwork(nodesByNetwork);

        doAnnotations(enclosedCircles, annotationAnchor);

      }

      // used to generate random nodes
      var index = 1;

      // draw refreshes the graph?
      draw();

      // add a function when "add" button is clicked
      document.getElementById("add").addEventListener("click", function() {
        action.addClicked(state);
      });

      // add a function when the `random` button is clicked
      document.getElementById("random").addEventListener("click", function() {
        action.randomClicked(state);
      });

      document.getElementById("reinitialize").addEventListener("click", function() {
        action.reinitializeClicked(state);
      });

      document.getElementById("destroy").addEventListener("click", function() {
        playSound("destroyer-sound", 0.1);
        action.runDestroyer(state);
      });

      document.getElementById("giver").addEventListener("click", function() {
        playSound("giver-sound", 0.1);
        db.runTheGiver(GIVER_POWER);
      });

      document.getElementById("snapshot").addEventListener("click", function() {
        db.snapshotState(state).then(function(result) {
          console.log("success snapshot: ", result);
        });
      });


      // zooming funtion given to d3
      // <svg transform="translate(10) + scale(2)">;
      var zoomFunction = function() {
        g.attr("transform", d3.event.transform);
      };

      // call zooming function when d3 detects a zoom
      var zoomCall = d3.zoom().scaleExtent([1 / 4, 4]).on("zoom", zoomFunction);
      svg.call(zoomCall.transform, d3.zoomIdentity.translate(svgWidth / 2, svgHeight / 2));
      svg.call(zoomCall);
      svg.on("dblclick.zoom", null);

      var zoomIn = function() {
        var currentScale = d3.zoomTransform(svg.node()).k;
        svg.transition().duration(500).call(zoomCall.scaleTo, currentScale + ZOOM_AMOUNT).transition();
      };

      var resetZoom = function() {
        svg.transition().duration(500).call(zoomCall.translateTo, MY_FIXED_X, MY_FIXED_Y).transition().duration(500).call(zoomCall.scaleTo, 1).transition();
      };

      var zoomOut = function() {
        var currentScale = d3.zoomTransform(svg.node()).k;
        svg.transition().duration(500).call(zoomCall.scaleTo, currentScale - ZOOM_AMOUNT).transition();
      };

      document.getElementById("zoom-in").addEventListener("click", zoomIn);
      document.getElementById("reset-button").addEventListener("click", resetZoom);
      document.getElementById("zoom-out").addEventListener("click", zoomOut);

      document.getElementById("add-player").addEventListener("click", function() {
        // in case the user is anonymous
        if(state.selfId) {
          //db.weakenNode(state.selfId, ADD_PLAYER_DECREMENT_NODE_SCORE);
          return true;
        }
      })

      document.body.addEventListener("keydown", function(e) {
        // console.log(e);
        //prevents accidental zooming
        if (e.target !== document.body) {
          return;
        } else if (e.key === "8") {
          zoomIn();
        } else if (e.key === "9") {
          resetZoom();
        } else if (e.key === "0") {
          zoomOut();
        }
      });
      // start listening to DB updates
      db.initPlayers(state);

      // This is onLogUpdate function
    }, function(s, msg) {
      ui.renderMyScore(s.selfId, s.seenNodes);
      scores.calculateCommonScore(s.edges, s.nodes, s.selfId);
      s.draw();
    });
  });
});
