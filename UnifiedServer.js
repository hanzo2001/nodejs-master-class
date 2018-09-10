import { parse } from 'url';
import { StringDecoder } from 'string_decoder';
import { errorHandlers } from "./errorHandlers";

const defaultUtf8decoder = new StringDecoder('utf-8');

const defaultRouter = {
	resolve: (method, path, request) => errorHandlers[404]
};

export class UnifiedServer {
	constructor(
		router,
		decoder,
	) {
		this.router = router || defaultRouter;
		this.decoder = decoder || defaultUtf8decoder;
	}
	
	serve(https, userRequest, serverResponse) {
		let buffer = '';
		userRequest.on('data', chunk => buffer += this.decoder.write(chunk));
		userRequest.on('end', () => {
			const userRequestData = requestDataGenerator(https, userRequest, buffer);
			const {method, path} = userRequestData;
			const responseHandler = this.router.resolve(method, path, userRequestData);
			responseHandler(userRequestData, serverResponse);
		});
	}
}

function requestDataGenerator(isSecure, userRequest, buffer) {
	let headers = userRequest.headers;
	let method = userRequest.method.toLowerCase()+'';
	let parsedUrl = parse(userRequest.url, true);
	let path = parsedUrl.pathname;
	let query = parsedUrl.query;
	let payload = buffer + this.decoder.end();

	return {isSecure, path, method, headers, query, payload};
}
