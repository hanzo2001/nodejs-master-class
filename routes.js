import { handlers } from "./handlers";

export const routes = [
	{
		method: 'get',
		path: 'ping',
		handler: handlers.ping,
		secure: false,
		writer: null,
	},
	{
		method: 'get',
		path: 'ping',
		handler: handlers.ping,
		secure: true,
		writer: null,
	},
];
