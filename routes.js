import { handlers } from "./handlers";

export const routes = [
	{
		secure: false,
		method: 'get',
		path: 'ping',
		handler: handlers.ping,
		writer: null,
	},
	{
		secure: true,
		method: 'get',
		path: 'ping',
		handler: handlers.ping,
		writer: null,
	},
];
