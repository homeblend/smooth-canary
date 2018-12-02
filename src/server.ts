import express from 'express';
import http from "http";
import socketIO from "socket.io";
const app = express();
const server = new http.Server(app);
// initialize socketIO
const socketIOServer = socketIO(server);
server.listen(8080);

socketIOServer.on('connection', (socket: SocketIO.Socket) => {
  socket.on('gas-volatility', (data: any) => {
    console.log(data);
  });
});
