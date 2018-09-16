const url = require("url");
const { StringDecoder } = require("string_decoder");

const { DefaultRouter } = require("./DefaultRouter");

const defaultUtf8decoder = new StringDecoder("utf8");

/**
 * One server to rule them all
 */
class UnifiedServer {
	/**
	 * Both are optional
	 * @param {Router} router routers have to resolve paths to response handlers
	 * @param {StringDecoder} decoder request payload decoder
	 */
	constructor(
		router,
		decoder,
	) {
		this.router = router || DefaultRouter;
		this.decoder = decoder || defaultUtf8decoder;
	}
	/**
	 * Callback for client requests
	 * @param {boolean} https define if the request is expected to be secure
	 * @param {object} userRequest all the user request data
	 * @param {object} serverResponse the server response object to setup a response writer
	 */
	serve(https, userRequest, serverResponse) {
		let buffer = "";
		userRequest.on("data", chunk => buffer += this.decoder.write(chunk));
		userRequest.on("end", () => {
			const userRequestData = this._requestDataGenerator(https, userRequest, buffer);
			const {method, path} = userRequestData;
			console.log(`${https?'Secured':'Normal'} ${method.toUpperCase()} ${path}`);
			let responseHandler;
			// try to get a handler, even if it's an error handler
			try {
				responseHandler = this.router.resolve(path, userRequestData);
			} catch (routingError) {
				responseHandler = this.router.resolveError(routingError, path, userRequestData);
			}
			// try to run the handler or switch to an error handler and run that
			try {
				responseHandler(userRequestData, serverResponse);
			} catch (runtimeError) {
				responseHandler = this.router.resolveError(runtimeError, path, userRequestData);
				responseHandler(null, serverResponse);
			}
		});
	}
	_requestDataGenerator(isSecure, userRequest, buffer) {
		let headers = userRequest.headers;
		let method = userRequest.method.toLowerCase()+"";
		let parsedUrl = url.parse(userRequest.url, true);
		let path = parsedUrl.pathname;
		let query = parsedUrl.query;
		let payload = buffer + this.decoder.end();
		try {
			payload = payload ? JSON.parse(payload) : null;
		} catch (error) {
			payload = null;
			console.log(`Bad json payload:`, buffer);
		}
		return {isSecure, path, method, headers, query, payload};
	}
}

exports.UnifiedServer = UnifiedServer;
