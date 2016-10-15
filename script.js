var wsUri = "ws://localhost:9000";
var output;
var connectionElem;

function init() {
  output = document.getElementById("output");
  connectionElem = document.getElementById("connectionInfo");
  initWebSocket();
}

function initWebSocket() {
  websocket = new WebSocket(wsUri);
  websocket.onopen = function(evt) { onOpen(evt) };
  websocket.onclose = function(evt) { onClose(evt) };
  websocket.onmessage = function(evt) { onMessage(evt) };
  websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
  connectionElem.innerHTML = "CONNECTED";
}

function onClose(evt) {
  connectionElem.innerHTML = "DISCONNECTED";
}

function onMessage(evt) {
  var msg = JSON.parse(evt.data);
  var id = msg.id;
  var text = msg.text;
  writeToScreen(id, text);
}

function onError(evt) {
  console.log(evt.data);
}

function doSend(message) {
  writeToScreen(1, message);
  websocket.send(message);
}

function writeToScreen(id, message) {
  var elem = document.getElementById(id);
  if (typeof(elem) == 'undefined' || elem == null) {
    elem = document.createElement("p");
    elem.id = id;
    elem.style.wordWrap = "break-word";
    elem.style.color = getRandomColour();
    output.appendChild(elem);
  }
  elem.innerHTML = elem.innerHTML + message;
}

function keyListener(event) {
  doSend(event.key);
}

function getRandomColour() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

window.addEventListener("load", init, false);

window,addEventListener("keypress", keyListener, false);
