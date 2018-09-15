
function rawResponseWriter(serverResponse) {
	return (statusCode, payload) => {
		serverResponse.setHeader('Content-Type', 'text/plain');
		serverResponse.writeHead(statusCode||200);
		serverResponse.end(payload||'');
	}
}

function jsonResponseWriter(serverResponse) {
	return (statusCode, payload) => {
		serverResponse.setHeader('Content-Type', 'application/json');
		serverResponse.writeHead(statusCode||200);
		serverResponse.end(JSON.stringify(payload||{}));
	}
}

function emptyResponseWriter(serverResponse) {
	return (statusCode) => {
		serverResponse.writeHead(statusCode||200);
		serverResponse.end();
	}
}

exports.rawResponseWriter = rawResponseWriter;
exports.jsonResponseWriter = jsonResponseWriter;
exports.emptyResponseWriter = emptyResponseWriter;
