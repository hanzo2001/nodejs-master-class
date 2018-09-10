import { Route } from "./Route.js";
import { errorHandlers } from "./errorHandlers.js";

export class Router {
	constructor() {
		this.routes = {
			get: [],
			put: [],
			post: [],
			delete: [],
			head: [],
			...errorHandlers,
		};
		this.secureRoutes = {
			get: [],
			put: [],
			post: [],
			delete: [],
			head: [],
			...errorHandlers,
		};
	}
	all(secure, route) {
		this.get(secure, route);
		this.put(secure, route);
		this.post(secure, route);
		this.delete(secure, route);
		this.head(secure, route);
	}
	get(secure, route)    { this.addRoute(secure, route, "get"); }
	put(secure, route)    { this.addRoute(secure, route, "put"); }
	post(secure, route)   { this.addRoute(secure, route, "post"); }
	delete(secure, route) { this.addRoute(secure, route, "delete"); }
	head(secure, route)   { this.addRoute(secure, route, "head"); }
	addRoute(requiresEncryption, route, method) {
		let collection = requiresEncryption ? this.secureRoutes : this.routes;
		collection[method].push(route);
	}
	setErrorHandler(code, handler, requiresEncryption) {
		let collection = requiresEncryption ? this.secureRoutes : this.routes;
		collection[code] = handler;
	}
	resolve(method, path, request) {
		let routes = request.isSecured ? this.secureRoutes[method] : this.routes[method];
		let route = routes.find(route => route.matches(path));
		if (request.isSecured) {
			route = this.routes[method].find(route => route.matches(path));
			if (route) {
				return errorHandlers[403];
			}
		}
		return route ? route.handler : this.routes.notFound;
	}
}
