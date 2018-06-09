
var ZOOM_AMOUNT = 0.5;

//location where my (ME) node will be fixed when it is drawn to screen
var MY_FIXED_X = 0;

//location where MY node will be fixed when it is drawn to screen
var MY_FIXED_Y = 0;

//default starting strength for each node
var INITIAL_NODE_SCORE = 100;

// default amount to add to sender's score when inviting another player
var INVITE_INCREMENT_SENDER_SCORE = 15;

// default amount to add to receiver's score when being invited by another player
var INVITE_INCREMENT_RECEIVER_SCORE = 35;

// Amount to increase the sender's score when they click on something
var CLICK_INCREMENT_SENDER_SCORE = 10;

// Amount to increase the receiver's score when they click on something
var CLICK_INCREMENT_RECEIVER_SCORE = 30;

// use as an "earliest timestamp" -- late on may 30th, 2018
var COMMON_EPOCH = 1527733382598;

// starting life
var STARTING_LIFE = 30;

var NODE_HEALTH_FULL = 99;
var NODE_HEALTH_HIGH = 80;
var NODE_HEALTH_MEDIUM = 50;
var NODE_HEALTH_LOW = 25;
var NODE_HEALTH_DEAD = 0;

// Maximum username length.
var MAXIMUM_USERNAME_LENGTH = 15;

// the default node radius
// var DEFAULT_NODE_RADIUS = 7;

// Version the snapshot database
var SNAPSHOT_VERSION = 1;

// The number of initial clicks
var INITIAL_CLICKS = 6;

// Number of ticks to do an animation for
var ANIMATION_TICKS = 125;

// color of click successful
var CLICK_SUCCESS_WAVE_COLOR = "yellow";

// Color of node when you try to click and you have no clicks
var CLICK_ERROR_NO_CLICKS_NODE_COLOR = "gray";

var DARK_PINK_RGB = "255, 69, 120";
var DARK_PINK_HEX = "#ff4578";
var LIGHT_PINK_RGB = "252, 121, 157";
var LIGHT_PINK_HEX = "#fc799d";

var DARK_PURPLE_RGB = "88, 0, 155";
var DARK_PURPLE_HEX = "#58009b";
var LIGHT_PURPLE_RGB = "184, 91, 255";
var LIGHT_PURPLE_HEX = "#b85bff";

// background is dark blue

var DARK_BLUE_RGB = "9, 6, 34";
var DARK_BLUE_HEX = "#090622";
var LIGHT_BLUE_RGB = "0, 128, 128";
var LIGHT_BLUE_HEX = "#008080";

var GREEN_RGB = "107, 220, 41";
var GREEN_HEX = "#6bdc29";

var YELLOW_RGB = "255, 226, 0";
var YELLOW_HEX = "#ffe200";
