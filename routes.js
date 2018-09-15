const { echo, hello, ping } = require("./handlers");
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
		writer: rawResponseWriter,
	},
];
