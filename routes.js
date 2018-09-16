const { echo, hello, ping, users } = require("./handlers");
const { rawResponseWriter } = require("./server/responseWriters");

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
	{
		secure: true,
		method: "post",
		path: "/users",
		handler: users,
		writer: null,
	},
	{
		secure: true,
		method: "get",
		path: "/users/{userPhone}",
		handler: users,
		writer: null,
	},
	{
		secure: true,
		method: "put",
		path: "/users/{userPhone}",
		handler: users,
		writer: null,
	},
	{
		secure: true,
		method: "delete",
		path: "/users/{userPhone}",
		handler: users,
		writer: null,
	},
];
