const { rawResponseWriter } = require("./responseWriters");

const { errorHandlers } = require("./errorHandlers");

class DefaultRouter {
	resolve(path, request) {
		const data = {method, path};
		return (_, serverResponse) => {
			console.log(this.constructor.name, request);
			errorHandlers[500](data, rawResponseWriter(serverResponse));
		}
	}
}

exports.DefaultRouter = DefaultRouter;
