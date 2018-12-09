import { DevEnvironment } from '../environment.dev';
import { SmoothCanaryServer } from './SmoothCanaryServer';

const server = new SmoothCanaryServer({
	host: DevEnvironment.HOST,
	port: DevEnvironment.PORT,
});
server.init();
server.start();
