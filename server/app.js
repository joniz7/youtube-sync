// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8081, clientTracking: true });
let clientId = 0;

server.on('connection', function connection(socket, request) {
  socket.send(JSON.stringify({id: ++clientId}));
  console.log('client connected with id '+clientId);
  socket.clientId = clientId;

  socket.on('message', function incoming(message) {
    console.log('got message', message);
    server.clients.forEach(conn => {
      console.log(conn.clientId, JSON.parse(message).clientId);
      if(conn.clientId != JSON.parse(message).clientId) {
        conn.send(message);
      }
    });
  });
});

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

module.exports = app;