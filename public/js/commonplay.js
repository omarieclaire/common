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
    var waves = importWaves();
		var scores = importScores();
		var util = importUtil(scores);
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

			document.getElementById("add-player").disabled = true;
			document.getElementById("add-link").disabled = true;
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
			// id of the current user (same as ME)
			selfId: currentUser.username,
			// color picker
			colorPicker: d3.scaleOrdinal(["#BC31F1", "#6B00B9", "#7e0caa"
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
			logEntry: null,
      animationNoClicksAvailable: null,
      animationClickSuccess: null,
		};

		var initializeGame = function (state) {

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

            simulation.on('end', function() { simulation.restart(); });

			// create a <g> element and append it into <svg>
			//create the graph itself
			var g = svg
				.append("g");

			// create a <g> element for annotations, append it to the first g
			var annotationAnchor = g
				.append("g")
				.attr("class", "annotationBox")
				.selectAll(".anchor");

			// create a <g> element for edges, append it to the previous g
			var edge = g
				.append("g")
				.attr("stroke", "#000")
				.attr("stroke-width", 0.5)
				.selectAll(".edge");

      var playerWavesColours = ["#FFADAE", DARK_PINK_HEX, "#ffcf2e"];
      var playerWavesFrequencies = [0, 0.5*Math.PI, Math.PI];
      var playerWaves = [];
      // if you want to add a third wave, put [0,1,2] in the array
      [0,1].forEach(function(i) {
        var elem =
          g.append("g").attr("id", "player-wave-" + i).selectAll(".playewave" + i);

        playerWaves.push(elem);
      });

			// create a <g> element for labels, append it to the first g
			var label = g
				.append("g")
				.attr("class", "nodeLabelContainer")
				.selectAll(".label");

			// create a <g> element for nodes, append it to the first g
			var node = g
				.append("g")
				.attr("id", "g-node")
				.selectAll(".node");

			var transparentNode = g
				.append("g")
				.attr("id", "g-trans-node")
				.selectAll(".transNode");

			// small helper function to claculate all enclosed circles
			// assumes nodesByNetwork is map (key-value pairs) of
			// key=netowrk-id
			// value=nodes in network-id
			function enclosedCirclesByNetwork(nodesByNetwork) {
				var enclosedCircles = [];
				Object.keys(nodesByNetwork).forEach(function(network, index) {
          var networkData = nodesByNetwork[network];
          if(networkData.nodes.length > 1) {
            var nodesInNetwork = networkData.nodes;
            var networkScore = networkData.score;
            var enclosedCircle = d3.packEnclose(nodesInNetwork);
            enclosedCircle.id = "enclosing-network-" + index;
            enclosedCircle.score = networkScore;
            enclosedCircles.push(enclosedCircle);
          }
				});
				return enclosedCircles;
			}

			// extremely side-effecty function
			function doAnnotations(enclosedCircles, annotationAnchor) {
				var annotations = enclosedCircles.map(function(circle, index) {
          var score;
          if(circle.score === undefined) {
            score = ":(";
          } else {
            score = circle.score.toString();
          }
					return {
						id: "annotation-" + index,
						note: {
							label: "Common Life Force",
							title: score,
							wrap: 400
						},
						dy: -(circle.r + 30),
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
			ui.renderMyScore(state);

			// function to refresh d3 (for any changes to the graph)?
			function draw() {

				// Apply the update to the nodes.
				// get nodes array, extract ids, and draw them
				node = node.data(state.nodes, function(d) {
					return "no-click-" + d.id;
				});
				node.exit().remove();
				node = node.enter()
					.append("circle")
					.attr("fill", function(d) {
						return d.color;
					})
					.attr("r", function(d) { return util.nodeRadius(d); })
				// add an id attribute to each node, so we can access/select it later
					.attr("id", function(d) { return "no-click-" + util.nodeIdAttr(d);})
					.attr("class", function(d) { return util.nodeClass(d,state); })
					.merge(node);

        // These are the nodes that people click on.
				transparentNode = transparentNode.data(state.nodes, function(d) {
					return d.id;
				});
				transparentNode.exit().remove();
				transparentNode = transparentNode.enter()
					.append("circle")
					.attr("fill", "black")
          .attr("fill-opacity", 0)
					.attr("r", function(d) { return util.nodeRadius(d) + 7; })
					.attr("id", util.nodeIdAttr)
          .attr("class", "transparentNode")
					.on("click", function(d) {
						action.nodeClicked(state, d);
					})
          .on("dblclick", function(d) {
            // in case the user is anonymous
            var myNode = state.seenNodes[state.selfId];
            if(myNode && myNode.clicks > 0) {
              //db.weakenNode(state.selfId, ADD_PLAYER_DECREMENT_NODE_SCORE);
              window.open('newconnection.html?username=' + d.id);
            } else {
              document.getElementById("poor-sound").play();
              return false;
            }
          })
					.merge(transparentNode);

				// In order to draw circles around each network, we calculate
				// the network scores. Then we mutate each node by adding
				// the network it belongs to.
				// Then we group each node by the network it belngs to
				// Then we use that group and d3.packEnclose to encircle the networks.
				// TODO it would be good to find a better place to calculate this stuff
				// rather than in draw
				var networkScores = scores.calculateNetworkScoresByNode(state);
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
					.attr("fill", "white")
					.attr("opacity", "0.5")
					.text(function(d) {
						return d.id;
					})
					.merge(label);

        var playerNode = state.seenNodes[state.selfId];
        var playerEdges = [];
        var otherEdges = [];
        if(playerNode) {
          var playerEdgesSet = util.playerEdgesSet(playerNode, state.edges);
          state.edges.forEach(function(edge) {
            if(playerEdgesSet.has(edge.id)) {
              playerEdges.push(edge);
            } else {
              otherEdges.push(edge);
            }
          });
        } else {
          otherEdges = state.edges;
        }

				// do the same thing for the edges
				edge = edge.data(otherEdges, function(d) {
					return d.source.id + "-" + d.target.id;
				});
				edge.exit().remove();
				//before .merge is where I can add the viz representation of the stroke/edge
				edge = edge.enter()
					.append("line")
					.attr("stroke-width", edgeStrength)
					.attr("id", util.edgeIdAttr)
					.attr("stroke", "gray")
					.merge(edge);

					// create a duplicate list of edges connected to the player.
					// getEdgesForNode(state.seenNodes[state.selfId], state.eedges).copy
					// (should make a copy - not sure how to copy stuff in javascript)
					// draw these edges ?

				// Check if the playerNode exists (if it's not null or undefined)
				// if it exists, playersEdges are the connected edges, otherwise they're
				// an empty array
        playerWaves.forEach(function(playerWave, index, array) {
          array[index] = playerWave.data(playerEdges, function(d) {
            return d.source.id + "-" + d.target.id + "-wave-" + index;
          });

          array[index].exit().remove();
          array[index] = array[index].enter()
            .append("path")
            .attr("d", function(edge) {
              var xStart = edge.source.x;
              var yStart = edge.source.y;
              var xEnd = edge.target.x;
              var yEnd = edge.target.y;
              return waves.wavePath(playerWavesFrequencies[index], xStart, yStart, xEnd, yEnd);
            })
            .attr("stroke-width", edgeStrength)
            .attr("stroke", playerWavesColours[index])
            .attr("fill", "none")
          // There is a bug in Chrome which prevents us from using this.
          // https://bugs.chromium.org/p/chromium/issues/detail?id=711955&q=mix-blend-mode&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified
            //.style("mix-blend-mode", "darken")
            .merge(array[index]);
        });

				// Update and restart the simulation.
				simulation.nodes(state.nodes);
				simulation.force("link").links(state.edges);
				simulation.alpha(1).restart();

			}

			// Update the draw on state once we've defined it
			// (doing this for initialization reasons)
			state.draw = draw;

			// function called on every "tick" of d3 like a clock or gameloop
			function ticked(e) {

        // animation for clicking a node.
        var anim = state.animationNoClicksAvailable;
				node
				//cx is the relative position of the node
					.attr("cx", function(d) {
						return d.x;
					})
					.attr("cy", function(d) {
						return d.y;
					})
					.attr("r", function(d) { return util.nodeRadius(d); })
					.attr("class", function(d) { return util.nodeClass(d,state); })
          .attr("fill", function(d) {
            if(anim && d.id === anim.targetNode && anim.ticks > 0) {
              return CLICK_ERROR_NO_CLICKS_NODE_COLOR;
            } else {
              return d.color;
            }
					});

        if(anim) {
          anim.ticks--;
          if(anim.ticks < 0) {
            state.animationNoClicksAvailable = null;
          }
        }

				transparentNode
					.attr("cx", function(d) {
						return d.x;
					})
					.attr("cy", function(d) {
						return d.y;
					})
					.attr("r", function(d) { return util.nodeRadius(d) + 7; })

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
					});
					// .attr("stroke-width", edgeStrength);

        var anim = state.animationClickSuccess;
        playerWaves.forEach(function(playerWave, index) {
          playerWave.attr("d", function(edge) {
            var xStart = edge.source.x;
            var yStart = edge.source.y;
            var xEnd = edge.target.x;
            var yEnd = edge.target.y;
            return waves.wavePath(playerWavesFrequencies[index], xStart, yStart, xEnd, yEnd);
          });
          // this animation stuff is a bit of a hack, but it's reliable.
          if(anim) {
            playerWave.attr("stroke", function(edge) {
              if(anim.edgeId === edge.id && anim.ticks > 0) {
                return CLICK_SUCCESS_WAVE_COLOR;
              } else {
                return playerWavesColours[index]
              }
            });
          }
        });
        if(anim) {
          anim.ticks--;
          if(anim.ticks < 0) {
            state.animationClickSuccess = null;
          }
        }

				label
					.attr("x", function(d) {
						return d.x + 7;
					})
					.attr("y", function(d) {
						return d.y - 4;
					});

				var nodesByNetwork = util.nodesByNetwork(node.data());
				var enclosedCircles = enclosedCirclesByNetwork(nodesByNetwork);

				doAnnotations(enclosedCircles, annotationAnchor);

			}

			// draw refreshes the graph?
			draw();

			// document.getElementById("reinitialize").addEventListener("click", function() {
			// 	action.reinitializeClicked(state);
			// });

			document.getElementById("destroy").addEventListener("click", function() {
				playSound("destroyer-sound", 0.1);
				action.runDestroyer(state);
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

			var zoomIn = function() {
				var currentScale = d3.zoomTransform(svg.node()).k;
				svg.transition().duration(500).call(zoomCall.scaleTo, currentScale + ZOOM_AMOUNT).transition();
			};

			var zoomLevel = function () {
				var defaultLevel = 1;

				// if the screen is small, reduce size by half
				if (svgWidth < 400 || svgHeight < 400) {
					return defaultLevel / 2;
				} else {
					return defaultLevel;
				}
			}

			var resetZoom = function() {
				svg.transition().duration(500).call(zoomCall.translateTo, MY_FIXED_X, MY_FIXED_Y).transition().duration(500).call(zoomCall.scaleTo, zoomLevel()).transition();
			};

			var zoomOut = function() {
				var currentScale = d3.zoomTransform(svg.node()).k;
				svg.transition().duration(500).call(zoomCall.scaleTo, currentScale - ZOOM_AMOUNT).transition();
			};

			// call zooming function when d3 detects a zoom
			var zoomCall = d3.zoom().scaleExtent([1 / 4, 4]).on("zoom", zoomFunction);
			svg.call(zoomCall.transform, d3.zoomIdentity.translate(svgWidth / 2, svgHeight / 2));
			svg.call(zoomCall.scaleTo, zoomLevel()).transition();
			svg.call(zoomCall);
			svg.on("dblclick.zoom", null);

			document.getElementById("zoom-in").addEventListener("click", zoomIn);
			document.getElementById("reset-button").addEventListener("click", resetZoom);
			document.getElementById("zoom-out").addEventListener("click", zoomOut);

			document.getElementById("add-player").addEventListener("click", function(e) {
				// in case the user is anonymous
				var myNode = state.seenNodes[state.selfId];
				if(myNode && myNode.clicks > 0) {
					//db.weakenNode(state.selfId, ADD_PLAYER_DECREMENT_NODE_SCORE);
					window.open('joinritual.html');
				} else {
					document.getElementById("poor-sound").play();
					e.preventDefault();
				}
			}, false);

			document.getElementById("add-link").addEventListener("click", function(e) {
				// in case the user is anonymous
				var myNode = state.seenNodes[state.selfId];
				if(myNode && myNode.clicks > 0) {
					//db.weakenNode(state.selfId, ADD_PLAYER_DECREMENT_NODE_SCORE);
					window.open('newconnection.html');
				} else {
					document.getElementById("poor-sound").play();
					e.preventDefault();
				}
			}, false);

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

      // Force a tick in the simulation every 3 seconds
      setInterval(function(){
        //simulation.alpha(0.1);
      },2000);

      // once a minute, try to gain a click
      window.setInterval(function () {
        action.tryToGainClicks(state);
      }, 60 * 1000);
      // unintentional race condition: we can't try to calculate
      // clicks too early because we don't know when the last message
      // we received was.
      window.setTimeout(function() {
        action.tryToGainClicks(state);
      }, 2*1000);

      // once a minute, have a 1/60 chance of running the destroyer
      window.setInterval(function () {
        action.tryDestroyer(state);
      }, 60 * 1000);
      action.tryDestroyer(state);

      var runSnapshotter =
        (new URLSearchParams(window.location.search)).has('snapshots');
      // If the snapshots query param is present then run the snapshotter
      // in the background every minute.
      if(runSnapshotter) {
        window.setInterval(function() {
          console.log("Capturing snapshot at key: " + state.logEntry);
          action.runSnapshotter(state);
        }, 60 * 1000);
      }
		};

		// This is an onLogUpdate function
		var onLogUpdate = function (state, msg) {
			ui.renderMyScore(state);
			scores.calculateCommonScore(state);
			state.draw();
			if(msg.type === "destroyEdge") {
				/*
				// attempt to animate edge destruction when Destroyer
				// destroys an edge.
				var source = msg.source;
				var target = msg.target;

				var gEdgeContainer = edge.node();
				var newpath = document.createElementNS('http://www.w3.org/2000/svg',"path");
				newpath.setAttributeNS('d', 'M' + source.x + ' ' + source.y + ' ' + target.x + ' ' + target.y);
				newpath.setAttributeNS('stroke','red');
				newpath.setAttributeNS('stroke-width', 10);
				gEdgeContainer.appendChild(newpath);
				*/
				//d3.select(edgeHtml).transition().duration(2000).attr("stroke", "red").transition().duration(2000).attr("stroke",null);
				playSound("destroyer-sound", 0.3);
			}

		};

		// We pass the initial state, and a
		// "initializeGame" function,
		// and onLogUpdate function.
    var startLogFromBeginning =
      (new URLSearchParams(window.location.search)).has('startLogFromBeginning');
		db.initLog(initialState, initializeGame, onLogUpdate, startLogFromBeginning);
	});
});
