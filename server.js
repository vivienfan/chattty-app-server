// server.js
const express       = require('express');
const WebSocket     = require('ws');
const SocketServer  = WebSocket.Server;
const uuid          = require('node-uuid');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

let counter = 0;
let totalColors = 4;

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');
  _increamentUser(); // when there is a new connected client, add the counter and broadcast

  ws.on('message', function incoming(message) {
    console.log('Receive:', message);
    let msg = JSON.parse(message);
    switch(msg.type) {
      case "postRegister":
        // randomly generate a class name to be used at client side to display username in certain color
        ws.color = `name-${Math.floor(Math.random() * totalColors + 1)}`;
        break;
      case "postNotification":
        _incomingNotification(msg); // parse the notification and broadcast
        break;
      case "postMessage":
        _incomingMessage(msg, ws.color);  // parse the message and broadcast
        break;
      default:
        console.error("Unknown event type " + msg.type);
    }
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    // when a client is diconnected, decreament the counter and broadcast
    _decreamentUser();
  });
});

// Broadcast to everyone.
const _broadcase = (res) => {
  console.log('Broadcast:', res);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(res);
    }
  });
}

const _increamentUser = () => {
  counter++;
  let res = {
    type: "incomingCounter",
    data: counter
  }
  _broadcase(JSON.stringify(res));
}

const _decreamentUser = () => {
  counter--;
  let res = {
    type: "incomingCounter",
    data: counter
  }
  _broadcase(JSON.stringify(res));
}

const _incomingNotification = (msg) => {
  let res = {
    type: "incomingNotification",
    data: {
      id: uuid.v1(),
      prevName: msg.data.prevName,
      newName: msg.data.newName
    }
  }
  _broadcase(JSON.stringify(res));
}

const _incomingMessage = (msg, color) => {
  // find all the min match of parts of the string that
  // starts with either http:// or https://, and ends with .jpg or .png, or .gif
  let regExp = new RegExp(/https?:\/{2}\S+?\.(jpg|png|gif)/gi);
  // find all the urls in the message
  let urls = msg.data.content.match(regExp);
  // replace html entities
  msg.data.content = _escapeHTML(msg.data.content);
  let res = {
    type: "incomingMessage",
    data: {
      id: uuid.v1(),
      username: msg.data.username,
      color: color,
      // if there is a url, call _parseURL to wrap the link in a html image tag
      content: urls ? _parseURL(msg.data.content, urls) : msg.data.content
    }
  };
  _broadcase(JSON.stringify(res));
}

// replace html entities character with their entity name
// this would allow html to display the character
// and prevent scripting attact
const _escapeHTML = (content) => {
  return content.replace(/[&<>"]/g, (tag) => {
    let chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&#quot;',
      "'": '&#apos;',
      ' ': '$nbsp;'
    };
    return chars[tag] || tag;
  });
}

// wrap each url in the message content in a image tag
// and return the new message content
const _parseURL = (content, urls) => {
  var regExp = new RegExp(urls.join('|'), 'gi');
  return content.replace(regExp, (chunk) => {
    if (chunk.match(regExp)) {
      return `<img src="${chunk}">`;
    }
  })
}