// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8081 });

const connections = [];

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    connections.forEach( conn => conn.send(message));
  });

  connections.push(ws);
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