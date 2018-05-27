var gameSounds = [
  "connection-forming-sound",
  "destroyer-sound",
  "error-sound",
  "giver-sound",
  "invitation-sound",
  "new-connection-sound",
  "player1-sound",
  "player2-sound",
  "poor-sound",
  "reinforcing-connection-sound"
];

gameSounds.forEach(function (path) {
  var audio = document.createElement("audio");
  audio.id = path;
  audio.src = "/sounds/" + path + ".mp3";
  audio.preload = "auto";
  document.body.appendChild(audio);
});

var playSound = function(id, volume) {
  var audio = document.querySelector("#" + id);
  audio.volume = (volume === undefined ? 1 : volume);
  audio.play();
};
