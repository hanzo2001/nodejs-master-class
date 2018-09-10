
export const handlers = {
	sample: (data, callback) => callback(406, {name: 'sampleHandler', ...data}),
	ping: (data, callback) => callback(200, data={msg:'pong'}),
};
