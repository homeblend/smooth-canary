import express from 'express';
import http from "http";
import socketIO from "socket.io";
const app = express();
const server = new http.Server(app);
// initialize socketIO
const socketIOServer = socketIO(server);
server.listen(8080);

console.log("smooth-canary started");
socketIOServer.on('connection', (socket: SocketIO.Socket) => {
  console.log("Received connection");
  socket.on('gas-volatility', (data) => {
    console.log("Handling Gas Volatility Message");
  });
});
