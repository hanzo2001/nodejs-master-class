const { rawResponseWriter } = require("./responseWriters");

const { errorHandlers } = require("./errorHandlers");

/*
 * The default router sets up a catch-all route that maps to a 500 error response
 */
class DefaultRouter {
	// resolves a path to handler. Called by the server
	resolve(path, userRequestData) {
		const { method } = userRequestData;
		const data = {method, path};
		// return the handler that ignores user data and just echoes the method and path
		return (_, serverResponse) => {
			console.log(this.constructor.name, userRequestData);
			errorHandlers[500](data, rawResponseWriter(serverResponse));
		}
	}
}

exports.DefaultRouter = DefaultRouter;
