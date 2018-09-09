const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

const decoder = new StringDecoder('utf-8');

const handlers = {
	sample: (data, callback) => callback(406, {name: 'sampleHandler', ...data}),
	notFound: (data, callback) => callback(404),
	ping: (data, callback) => callback(200, {msg:'pong'}),
};

const router = {
	'sample': handlers.sample,
	'ping': handlers.ping,
	'404': handlers.notFound
};

function responseDataGenerator(req) {
	let headers = req.headers;
	let method = req.method.toLowerCase()+'';
	let parsedUrl = url.parse(req.url, true);
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/(?:^\/+)|(?:\/+$)/, '');
	let query = parsedUrl.query;
	let payload = buffer + decoder.end();

	return {trimmedPath, method, headers, query, payload};
}

function responseHandlerBroker(path) {
	return router[path] || router[404];
}

function jsonResponseWriterGenerator(res) {
	return (statusCode, payload) => {
		statusCode = statusCode || 200;
		payload = payload || {};
		let payloadString = JSON.stringify(payload);
		res.setHeader('Content-Type', 'application/json');
		res.writeHead(statusCode);
		res.end(payloadString);
		console.log('payload=',buffer);
	};
}

var unifiedServer = function (req, res) {
	let buffer = '';
	req.on('data', chunk => buffer += decoder.write(chunk));
	req.on('end', () => {
		let responseData = responseDataGenerator(req);
		let responseHandler = responseHandlerBroker(responseData.trimmedPath);
		let responseWriter = jsonResponseWriterGenerator(res);
		responseHandler(responseData, responseWriter);
	});
	console.log(headers);
};

var httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

var httpsServerOptions = {
	key: fs.readFileSync('./https/key.pem'),
	cert: fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
	console.log(`Listening on port ${config.httpPort} in ${config.envName} mode`);
});

httpsServer.listen(config.httpsPort, () => {
	console.log(`Listening securely on port ${config.httpsPort} in ${config.envName} mode`);
});
