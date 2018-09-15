const url = require("url");
const { StringDecoder } = require("string_decoder");

const { DefaultRouter } = require("./DefaultRouter");

const defaultUtf8decoder = new StringDecoder("utf8");


class UnifiedServer {
	constructor(
		router,
		decoder,
	) {
		this.router = router || DefaultRouter;
		this.decoder = decoder || defaultUtf8decoder;
	}
	
	serve(https, userRequest, serverResponse) {
		let buffer = "";
		userRequest.on("data", chunk => buffer += this.decoder.write(chunk));
		userRequest.on("end", () => {
			const userRequestData = this.requestDataGenerator(https, userRequest, buffer);
			const {method, path} = userRequestData;
			console.log(`${https?'Secured':'Normal'} ${method.toUpperCase()} ${path}`);
			let responseHandler;
			try {
				responseHandler = this.router.resolve(path, userRequestData);
			} catch (routingError) {
				responseHandler = this.router.resolveError(routingError, path, userRequest);
			}
			try {
				responseHandler(userRequestData, serverResponse);
			} catch (runtimeError) {
				responseHandler = this.router.resolveError(runtimeError, path, userRequest);
				responseHandler(null, serverResponse);
			}
		});
	}
	requestDataGenerator(isSecure, userRequest, buffer) {
		let headers = userRequest.headers;
		let method = userRequest.method.toLowerCase()+"";
		let parsedUrl = url.parse(userRequest.url, true);
		let path = parsedUrl.pathname;
		let query = parsedUrl.query;
		let payload = buffer + this.decoder.end();
		return {isSecure, path, method, headers, query, payload};
	}
}

exports.UnifiedServer = UnifiedServer;
