
exports.errorHandlers = {
	default: (_, callback) => callback(500),
	500: (data, callback) => callback(500, data||null),
	400: (data, callback) => callback(400, data||null),
	404: (data, callback) => callback(404, data),
	403: (data, callback) => callback(403, data=null),
};
