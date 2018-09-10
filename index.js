import { createServer } from 'http';
import { createServer as createSecureServer } from 'https';
import { readFileSync } from 'fs';

import { UnifiedServer } from './UnifiedServer';
import { Router } from "./Router";

import { x509key, x509cert, httpPort, envName, httpsPort } from './config';

import { routes } from "./routes";

const router = new Router();
const server = new UnifiedServer(router);

const httpsServerOptions = {
	key: readFileSync(x509key),
	cert: readFileSync(x509cert)
};

const httpsServer = createSecureServer(httpsServerOptions, (request, response) => server.serve(true, request, response));
const httpServer = createServer((request, response) => server.serve(false, request, response));

routes.forEach(r => router[r.method](r.secure, new Route(r.secure, r.path, r.handler, r.writer)));

httpsServer.listen(httpsPort, () => console.log(`Listening securely on '${envName}' port ${httpPort}`));
httpServer.listen(httpPort, () => console.log(`Listening on '${envName}' port ${httpPort}`));
