const http = require('http');
const https = require('https');
const fs = require('fs');

const { UnifiedServer } = require("./server/UnifiedServer");
const { Router } = require("./server/Router");
const { Route } = require("./server/Route");

const { x509key, x509cert, httpPort, envName, httpsPort } = require("./config");

const { routes } = require("./routes");

// prepare a router to manage available routes
const router = new Router();

// setup the unified server with the router
const server = new UnifiedServer(router);

// secure options requirements
const httpsServerOptions = {
	key: fs.readFileSync(x509key),
	cert: fs.readFileSync(x509cert)
};

// prepare a secure server
const httpsServer = https.createServer(httpsServerOptions, (request, response) => server.serve(true, request, response));

// prepare a normal server
const httpServer = http.createServer((request, response) => server.serve(false, request, response));

// add all the routes to the router
routes.forEach(r => router[r.method](new Route(r.secure, r.path, r.handler, r.writer)));

// start the real application
httpsServer.listen(httpsPort, () => console.log(`Listening securely on '${envName}' port ${httpsPort}`));
httpServer.listen(httpPort, () => console.log(`Listening normally on '${envName}' port ${httpPort}`));
