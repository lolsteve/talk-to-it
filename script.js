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
  websocket.send('aa');
}

function onClose(evt) {
  connectionElem.innerHTML = "DISCONNECTED";
}

function onMessage(evt) {
  var msg = JSON.parse(evt.data);

  switch(msg.type) {
    case 'message':
      var id = msg.id;
      var text = msg.text;
      writeToScreen(id, text);
      break;
    case 'users':
      var users = msg.users;
      updateUsers(users);
      break;
    default:
      console.log('Unknown message type' + msg.type);
  }
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
  var originalLength = elem.innerHTML.length
  elem.innerHTML = elem.innerHTML + message;
  var lengthDiff = elem.innerHTML.length - originalLength
  setTimeout(function(){ removeFromScreen(id, lengthDiff); }, 5000);
}

function removeFromScreen(id, num) {
  var elem = document.getElementById(id);
  elem.innerHTML = elem.innerHTML.substring(num);
  if(elem.innerHTML === '' && id != 1) {
    output.removeChild(elem);
  }
}

function updateUsers(users) {
  connectionElem.innerHTML = "USERS: " + users;
}

function keyListener(event) {
  if (event.key !== undefined) {
    doSend(event.key);
  } else if (event.keyCode !== undefined) {
    doSend(String.fromCharCode(event.keyCode));
  } else {
    console.log(event);
  }
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

window.addEventListener("keypress", keyListener, false);
