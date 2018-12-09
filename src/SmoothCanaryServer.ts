import express from 'express';
import firebaseAdmin from 'firebase-admin';
import http, { Server } from "http";
import { AddressInfo } from "net";
import socketIO from "socket.io";
import { Logger } from "winston";
import { SensorMessage } from "./interfaces/SensorMessage.interface";
import { ServerConfig } from "./interfaces/ServerConfig.interface";
import createLogger from "./LoggerFactory";
import { isDefined } from "./utils";

const serviceAccount = require('/etc/homeblend/service-account-key.json');

export class SmoothCanaryServer {
    // node http server
    private server: Server;
    private socketServer: SocketIO.Server;
    private logger: Logger = createLogger("Smooth Canary Server");
    private host: string = "localhost";
    private port: string = "8080";
    private firebaseApp: firebaseAdmin.app.App;
    private database: FirebaseFirestore.Firestore;

    constructor(private config: ServerConfig) { }

    public init(): void {
        this.logger.info("Initializing Server");
        this.server = new http.Server(express());
        this.socketServer = socketIO(this.server);
        if (!isDefined(this.config.host)) {
            this.logger.warn(`No host specified; using default host of ${this.host}`);
        } else {
            this.host = this.config.host;
        }
        if (!isDefined(this.config.port)) {
            this.logger.warn(`No port specified; using default port of ${this.port}`);
        } else {
            this.port = this.config.port;
        }
    }

    public start(): void {
        this.logger.info("Starting server");
        if (isDefined(this.server)) {
            this.server.listen(this.port, this.host as any, () => {
                // get server address information
                const addressInfo = this.server.address() as AddressInfo;
                const hostAddr = addressInfo.address;
                const portAddr = addressInfo.port + "";
                if (this.host !== hostAddr) {
                    this.logger.warn(`Server started with weird host name.  Expected ${this.host} but got ${hostAddr}`);
                }
                if (this.port !== portAddr) {
                    this.logger.warn(`Server started with weird port.  Expected ${this.port} but got ${portAddr}`);
                }
                this.logger.info(`Server started on http://${hostAddr}:${portAddr}`);
                this.initSocketListeners();
                this.initFirebase();
            });
        } else {
            this.logger.error("Failed to start server; could not find defined http server to create");
        }
    }

    public stop(): void {
        this.logger.info("Stopping server");
        if (isDefined(this.server)) {
            this.server.close(() => {
                this.logger.info("Server stopped.");
            });
        } else {
            this.logger.error("Failed to stop server; could not find defined http server to stop");
        }
    }

    private initSocketListeners() {
        this.socketServer.on('connection', (socket: SocketIO.Socket) => {
            this.logger.info("A new socket client has connected");
            socket.on('sensor-message', async (message: SensorMessage) => {
                if (isDefined(message)) {
                    this.logger.info("Received new sensor reading");
                    const docRef = await this.database.collection('readings').add(message);
                    this.logger.info(`Added new document with ID: ${docRef.id}`);
                }
            });
        });
    }

    private initFirebase() {
        this.firebaseApp = firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
            databaseURL: "https://homeblend-68d5c.firebaseio.com"
        });
        this.database = this.firebaseApp.firestore();
    }
}
