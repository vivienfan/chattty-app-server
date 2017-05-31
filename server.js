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

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    console.log(message);
    let msg = JSON.parse(message);
    switch(msg.type) {
      case "postNotification":
        let newNoti = {
          type: "incomingNotification",
          data: {
            prevName: msg.data.prevName,
            newName: msg.data.newName
          }
        }
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newNoti));
          }
        })
        break;
      case "postMessage":
        let newMsg = {
          type: "incomingMessage",
          data: {
            id: uuid.v1(),
            username: msg.data.username,
            content: msg.data.content
          }
        };
        // Broadcast to everyone.
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(newMsg));
          }
        });
        break;
      default:
        console.error("Unknown event type " + msg.type);
    }
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});

// _broadcast (msg) => {
//   wss.clients.forEach(func)
// }