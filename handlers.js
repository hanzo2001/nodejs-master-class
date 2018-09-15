
function echoController(data, callback) {
	callback(406, data);
}

function pingController(data, callback) {
	data = 'pong';
	callback(200, data);
}

function helloController(data, callback) {
	const pathData = data.pathData;
	const name = pathData && pathData.name ? pathData.name : null;
	const msg = name ? `Nice to meet you, ${name}` : "Hello there";
	callback(200, {msg});
}

exports.echo = echoController;
exports.ping = pingController;
exports.hello = helloController;
