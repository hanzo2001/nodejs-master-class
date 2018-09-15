
function echoController(data, callback) {
	callback(406, data);
}

function pingController(data, callback) {
	data = 'pong';
	callback(200, data);
}

function helloController(data, callback) {
	const name = data.pathData.name;
	const msg = `Nice to meet you, ${name}`;
	callback(200, msg);
}

exports.echo = echoController;
exports.ping = pingController;
exports.hello = helloController;
