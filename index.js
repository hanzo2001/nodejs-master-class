const http = require('http');
const https = require('https');
const fs = require('fs');

const { UnifiedServer } = require("./server/UnifiedServer");
const { Router } = require("./server/Router");
const { Route } = require("./server/Route");

const { x509key, x509cert, httpPort, envName, httpsPort } = require("./config");

const { routes } = require("./routes");

const router = new Router();
const server = new UnifiedServer(router);

const httpsServerOptions = {
	key: fs.readFileSync(x509key),
	cert: fs.readFileSync(x509cert)
};

const httpsServer = https.createServer(httpsServerOptions, (request, response) => server.serve(true, request, response));
const httpServer = http.createServer((request, response) => server.serve(false, request, response));

routes.forEach(r => router[r.method](new Route(r.secure, r.path, r.handler, r.writer)));

httpsServer.listen(httpsPort, () => console.log(`Listening securely on '${envName}' port ${httpsPort}`));
httpServer.listen(httpPort, () => console.log(`Listening on '${envName}' port ${httpPort}`));
