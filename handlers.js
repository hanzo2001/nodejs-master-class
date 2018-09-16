const { bootstrapUsersController } = require("./bootstrap");

function echoController(requestData, callback) {
	callback(406, requestData);
}

function pingController(requestData, callback) {
	const data = 'pong';
	callback(200, data);
}

function helloController(requestData, callback) {
	const pathData = requestData.pathData;
	const name = pathData && pathData.name ? pathData.name : null;
	const msg = name ? `Nice to meet you, ${name}` : "Hello there";
	const data = { msg };
	callback(200, data);
}

exports.echo = echoController;
exports.ping = pingController;
exports.hello = helloController;
exports.users = bootstrapUsersController();
