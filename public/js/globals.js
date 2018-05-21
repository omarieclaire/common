/* global d3:false _:false */

var ZOOM_AMOUNT = 0.5;
//location where my (ME) node will be fixed when it is drawn to screen
var MY_FIXED_X = 0;
//location where MY node will be fixed when it is drawn to screen
var MY_FIXED_Y = 0;
//default starting strength for each edge
var DEFAULT_STRENGTH = 1;
//capping the strength of each edge
var MAX_EDGE_STRENGTH = 9;
//default starting strength for each node
var INITIAL_NODE_SCORE = 8;
//the default amount of "life-force" a network receives
var GIVER_POWER = 0.5;
//the default amount of "life force" decayed by entropy/destroyer
var DESTROYER_POWER = 0.5;
//the "life force" a player trades to strengthen a edge
var CLICK_NODE_DESTROYER_POWER = 2;
//the edge-strength increase-when the node is clicked
var CLICK_EDGE_INCREMENTER = 0.5;
//pretend we know who the user is, "i"
var ME = "i";
