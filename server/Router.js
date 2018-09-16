const { errorHandlers } = require("./errorHandlers.js");
const { jsonResponseWriter, emptyResponseWriter } = require("./responseWriters");

const { UNKNOWN_HANDLER, HTTP_BAD_REQUEST, HTTP_FORBIDDEN, HTTP_NOT_FOUND, HTTP_INTERNAL_ERROR, BAD_PATH_VARTYPE, BAD_PATH_VARNUM } = require("./errorCodes");

/**
 * Route registry and request to response broker
 */
class Router {
	constructor() {
		this.defaultErrorHandler = errorHandlers[500];
		this.errorHandlers = errorHandlers;
		this.routes = {
			get: [],
			put: [],
			post: [],
			delete: [],
			head: [],
		};
		this.secureRoutes = {
			get: [],
			put: [],
			post: [],
			delete: [],
			head: [],
		};
	}
	/**
	 * Register a route on every method
	 * @param {Route} route route to register
	 */
	all(route) {
		this.get(route);
		this.put(route);
		this.post(route);
		this.delete(route);
		this.head(route);
	}
	get(route)    { this.addRoute(route, "get"); }
	put(route)    { this.addRoute(route, "put"); }
	post(route)   { this.addRoute(route, "post"); }
	delete(route) { this.addRoute(route, "delete"); }
	head(route)   { this.addRoute(route, "head"); }
	/**
	 * Lower level registry
	 * @param {Route} route route to register
	 * @param {string} method method string
	 */
	addRoute(route, method) {
		const requiresEncryption = route.requiresEncryption;
		if (requiresEncryption === null) {
			this.secureRoutes[method].push(route);
			this.routes[method].push(route);
		} else {
			(requiresEncryption ? this.secureRoutes : this.routes)[method].push(route);
		}
	}
	/**
	 * Return a response handler from a request
	 * @param {string} path request path
	 * @param {object} request all the request data
	 */
	resolve(path, request) {
		let {method, isSecure} = request;
		let route = isSecure
			? this.getSecureRoute(method, path)
			: this.getRoute(method, path);
		if (!route) {
			if (!request.isSecure && this.getSecureRoute(method, path)) {
				throw HTTP_FORBIDDEN;
			}
			throw HTTP_NOT_FOUND;
		}
		const handler = route.handler;
		if (!handler) {
			throw UNKNOWN_HANDLER;
		}
		return handler;
	}
	/**
	 * Broker a response handler in case of errors
	 * @param {number|object} error error code or object with code and message
	 * @param {string} path request path
	 * @param {object} request all the request data
	 */
	resolveError(error, path, request) {
		let {method} = request;
		let writer = serverResponse => jsonResponseWriter(serverResponse);
		let code = 500;
		if (error && error.code) {
			code = error.code;
		} else if (typeof error === "number") {
			code = error;
		}
		let msg = error && error.msg ? error.msg : "";
		switch (code) {
			case UNKNOWN_HANDLER:
				msg = msg || `Unknown handler for request for path: ${method} ${path}`;
				code = HTTP_INTERNAL_ERROR;
				break;
			case BAD_PATH_VARTYPE:
				msg = msg || `Wrong variable type in path: ${method} ${path}`;
				code = HTTP_BAD_REQUEST;
				break;
			case BAD_PATH_VARNUM:
				msg = msg || `Conflicting number of variables in request for path: ${method} ${path}`;
				code = HTTP_BAD_REQUEST;
				break;
			case HTTP_FORBIDDEN:
				msg = msg || `Insecure request for path: ${method} ${path}`;
				writer = emptyResponseWriter;
				break;
			case HTTP_BAD_REQUEST:
				msg = msg || `Bad request for path: ${method} ${path}`;
				break;
			case HTTP_NOT_FOUND:
				msg = msg || `No route found for path: ${method} ${path}`;
				break;
			case HTTP_INTERNAL_ERROR:
				msg = msg || `Unhandled error for ${method} ${path}`;
				break;
		}
		console.log(msg);
		let data = this._cleanupBadErrorData({ code, msg }, path);
		let handler = errorHandlers[code] || errorHandlers.default;
		return (_, serverResponse) => handler(data, writer(serverResponse));
	}
	/**
	 * Get a secure route from a determined path on a specific method
	 * @param {string} method request method
	 * @param {string} path request path
	 */
	getSecureRoute(method, path) {
		return this.secureRoutes[method].find(route => route.matches(path));
	}
	/**
	 * Get a normal route from a determined path on a specific method
	 * @param {string} method request method
	 * @param {string} path request path
	 */
	getRoute(method, path) {
		return this.routes[method].find(route => route.matches(path));
	}
	_cleanupBadErrorData(data, path) {
		const contactDevs = "Contact developers";
		if (!data) {
			console.log('Unhandled error for request for path', path);
			data = {code:500, msg:contactDevs};
		}
		if (!data) {
			console.log('Unhandled falsy error for request for path', path);
			let code = typeof data === "number" ? code : 500;
			data = {code:500, msg:data.msg||contactDevs};
		}
		if (typeof data.code !== "number") {
			console.log('Bad error code for request for path', path);
			data = {code:500, msg:`[${data.code}] ${data.msg||contactDevs}`};
		}
		if (typeof data.msg !== "string" || !data.msg) {
			console.log('Missing error message for request for path', path);
			data = {code:data.code, msg:contactDevs};
		}
		return data;
	}
}

exports.Router = Router;
