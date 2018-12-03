import dotenv from 'dotenv';
import express from 'express';
import http from "http";
import { AddressInfo } from 'net';
import socketIO from "socket.io";
import createLogger from './LoggerFactory';
import { isDefined } from './utils';

// loading environment file
dotenv.config();

const logger = createLogger();
const app = express();
const server = new http.Server(app);
// setting defaults
const defaultHostName = "http://localhost";
const defaultPort = '8080';

// initialize socketIO
const socketIOServer = socketIO(server);
if (!isDefined(process.env.HOSTNAME)) {
	logger.info(`Server hostname was not specified in config file; using default of ${defaultHostName}`);
	process.env.HOSTNAME = defaultHostName;
}
if (!isDefined(process.env.SERVER_PORT)) {
	logger.info(`Server port was not specified in config file; using default of ${defaultPort}`);
	process.env.SERVER_PORT = defaultPort;
}
// casting hostname as any because there's a weird type error otherwise
server.listen(process.env.SERVER_PORT, process.env.HOSTNAME as any);
const address = server.address() as AddressInfo;
const host = address.address;
const port = address.port;
logger.info(`smooth-canary server started on ${host}:${port}`);
socketIOServer.on('connection', (socket: SocketIO.Socket) => {
	logger.info("A new client has connected");
	socket.on('gas-volatility', (data) => {
		logger.info("Handling Gas Volatility Message");
		logger.info(data);
	});
});
socketIOServer.on('close', (socket: SocketIO.Socket) => {
	logger.info("A client has disconnected");
});
