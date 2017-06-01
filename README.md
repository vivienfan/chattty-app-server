Chattty-app-server Project
=====================

Chattty-app-server is the back-end server for [Chatty-app](https://github.com/vivienfan/chatty-app).

### Final Product
* The Chatty client app and Chatty websocket server are separate Node apps each with their own package.json
* It's a simple server using express and ws
* The server should send and receive JSON-encoded messages
* When a client sends a message:
  - the server should determine what to do based on the message's type property
  - it should construct a message to send back in response with a corresponding type and a generated unique id (e.g. a UUID)
* When a client connects or disconnects, the server should broadcast the current user count to all connected clients
* The server assigns and keeps track of user colours
* The server parse message content containing image url links to enable image displacement at the front-end

### Usage

Clone this repository, as well as [chatty-app](https://github.com/vivienfan/chatty-app).

Install the dependencies and start the server.

```
npm install
npm start
```
Then follow the instruction listed in [chatty-app](https://github.com/vivienfan/chatty-app).


### Dependencies
* express
* node-uuid
* ws
