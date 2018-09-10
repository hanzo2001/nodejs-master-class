
export function jsonResponseWriter(serverResponse) {
	return (statusCode, payload) => {
		serverResponse.setHeader('Content-Type', 'application/json');
		serverResponse.writeHead(statusCode||200);
		serverResponse.end(JSON.stringify(payload||{}));
	}
}

export function emptyResponseWriter(serverResponse) {
	return (statusCode) => {
		serverResponse.writeHead(statusCode||200);
		serverResponse.end();
	}
}
