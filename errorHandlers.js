
export const errorHandlers = {
	400: (data, callback) => callback(400, data||null),
	403: (data, callback) => callback(403, data||null),
	404: (data, callback) => callback(404, data=null),
};
