const { BAD_PATH_VARTYPE, BAD_PATH_VARNUM } = require("./errorCodes");

const { jsonResponseWriter, emptyResponseWriter } = require("./responseWriters");

class Route {
	constructor(requiresEncryption, path, requestHandler, responseWriter) {
		this.requiresEncryption = requiresEncryption;
		this.path = path.replace(lastSlashDetector, "");
		this.isComplex = isComplexPathString(path);
		this.requestHandler = requestHandler;
		this.parseSections = () => ({});
		this.writer = responseWriter || jsonResponseWriter;
		this.re_matcher = null;
		if (this.isComplex) {
			let {equalityFn, parseSections, re_matcher} = compileComplexPathResolver(path);
			this.equalityFn = equalityFn;
			this.parseSections = parseSections;
			this.re_matcher = re_matcher;
		} else {
			this.equalityFn = this.compareStringPaths;
		}
		this.handler = (userRequestData, userResponse) => {
			let method = userRequestData.method;
			let pathData = this.parseSections(userRequestData.path);
			let writer = method === "head" ? emptyResponseWriter : this.writer;
			this.requestHandler({...userRequestData, pathData}, writer(userResponse));
		};
	}
	matches(path) {
		return this.equalityFn(path);
	}
	getRequestStringVariables(requestPath) {
		return this.isComplex ? this.parseSections(requestPath) : {};
	}
	compareStringPaths(requestedPath) {
		requestedPath = requestedPath.replace(lastSlashDetector, "");
		return requestedPath === this.path;
	}
}

const identityFn = v => v;
const alwaysTrue = () => true;

const lastSlashDetector = /\/+$/;

const complexPathDetector = /\{[a-z]\w*(:\w+)?\}/i;

const complexPathExtractor = /\/\{([a-z]\w*)(?::([a-z]+))?\}(\/|$)/i;

const numberValidator = /^(\+|-)?(0|([1-9]\d+))$/;
const numberRegexStr = "(?:\\+|-)?(?:0|(?:[1-9]\\d+))";

const wordValidator = /^[a-z]\w*$/i;
const wordRegexStr = "[a-zA-Z][a-zA-Z_]";

function isComplexPathString(path) {
	return complexPathDetector.test(path);
}

function compileComplexPathResolver(path) {
	let incomming_str = path;
	let re_str = path;
	let offset = 0;
	let variableSections = [];
	let section;
	while (section = complexPathExtractor.exec(path.substring(offset))) {
		let {fullMatch, varName, varType, nextOffset} = translateSectionParams(section);
		let pathtTokenParams = pathTokenTypes[varType] || pathTokenTypes["string"];
		offset += nextOffset;
		re_str = re_str.replace(fullMatch, `/(${pathtTokenParams.regex})`);
		incomming_str = incomming_str.replace(fullMatch, `/([^/]+)`);
		variableSections.push({ ...pathtTokenParams, varName });
	}
	
	let re_matcher = new RegExp(`^${re_str}/?$`);
	let re_incomming = new RegExp(`^${incomming_str}/?$`);
	let equalityFn = path => re_incomming.test(path);
	let parseSections = pathSectionParserGenerator(variableSections, re_incomming);
	return { equalityFn, parseSections, re_matcher };
}

function translateSectionParams(section) {
	let fullMatch = section[0];
	let varName = section[1];
	let varType = section[2];
	let lastSlash = section[3];
	let foundIndex = section.index;
	let nextOffset = foundIndex + fullMatch.length - (lastSlash||"").length;
	return {
		fullMatch,
		varName,
		varType,
		nextOffset
	};
}

function pathSectionParserGenerator(variableSectionAttributesList, re_pathSplitter) {
	return path => {
		let variableParts = (re_pathSplitter.exec(path)||[]).slice(1);
		let mandatorySize = variableSectionAttributesList.length;
		if (variableParts.length !== mandatorySize) { throw BAD_PATH_VARNUM; }
		if (variableParts) {
			return variableSectionAttributesList
				.map((sectionAttributes, i) => {
					return { ...sectionAttributes, pathPart:variableParts[i] };
				})
				.map((section) => {
					let {isValid, filter, varName, pathPart} = section;
					if (!isValid(pathPart)) { throw BAD_PATH_VARTYPE; }
					return {k:varName, v:filter(pathPart)};
				})
				.reduce((p, c)=>{return (p[c.k] = c.v),p;}, Object.create(null));
		}
		console.log('Something is wrong with the pathSectionParser');
		console.log('the path', path);
		console.log('the re_incomming', re_pathSplitter);
		console.log('the pieces', variableSectionAttributesList);
		return null;
	};
}

const pathTokenTypes = {
	"string": {
		type: "string",
		regex: "[^/]+",
		isValid: alwaysTrue,
		filter: identityFn,
	},
	"word": {
		type: "word",
		regex: wordRegexStr,
		isValid: v => wordValidator.test(v),
		filter: identityFn,
	},
	"number": {
		type: "number",
		regex: numberRegexStr,
		isValid: v => numberValidator.test(v),
		filter: v => parseInt(v, 10),
	}
}

exports.Route = Route;
