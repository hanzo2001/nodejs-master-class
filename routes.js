const { echo, hello, ping, users } = require("./handlers");
const { rawResponseWriter } = require("./server/responseWriters");

const { Route } = require("./server/Route");

exports.routes = [
	{
		secure: null,
		method: "get",
		path: "/ping",
		handler: ping,
		writer: rawResponseWriter,
	},
	{
		secure: false,
		method: "get",
		path: "/echo/{id:number}",
		handler: echo,
		writer: null,
	},
	{
		secure: false,
		method: "get",
		path: "/hello",
		handler: hello,
		writer: null,
	},
	{
		secure: true,
		method: "get",
		path: "/hello/{name}",
		handler: hello,
		writer: null,
	},
	{ method: "post",   route: new Route(true, "/users", users, null), },
	{ method: "get",    route: new Route(true, "/users/{userPhone}", users, null), },
	{ method: "put",    route: new Route(true, "/users/{userPhone}", users, null), },
	{ method: "delete", route: new Route(true, "/users/{userPhone}", users, null), },
];
