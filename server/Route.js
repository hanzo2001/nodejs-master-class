const { BAD_PATH_VARTYPE, BAD_PATH_VARNUM } = require("./errorCodes");
const { pathTokenTypes } = require("./pathTokenTypes")
const { jsonResponseWriter, emptyResponseWriter } = require("./responseWriters");

/**
 * Every registered route instance will open a new api point on the router
 */
class Route {
	/**
	 * The constructor builds the request path analyzer and parser
	 * @param {boolean} requiresEncryption self-explanatory
	 * @param {string} path self-explanatory
	 * @param {(data, callback)=>void} requestHandler the callback that processes the request
	 * @param {(serverResponse)=>(code, data)=>void} responseWriter the callback that sets up the response
	 */
	constructor(requiresEncryption, path, requestHandler, responseWriter) {
		// [readonly]
		this.requiresEncryption = requiresEncryption;
		// request paths cannot end in slashes
		this.path = path.replace(lastSlashDetector, "");
		// complex routes have variable sections: /static/{variable}
		this.isComplex = isComplexPathString(path);
		this.requestHandler = requestHandler;
		// the default parser should return null on simple paths
		this.parseSections = () => null;
		// the default response writer uses JSON
		this.writer = responseWriter || jsonResponseWriter;
		// for debugging purposes
		//this.re_matcher = null;
		// the default test for path matching is a simple === between strings
		this.equalityFn = this._compareStringPaths;
		if (this.isComplex) {
			let {equalityFn, parseSections} = compileComplexPathResolver(path);
			//let {equalityFn, parseSections, re_matcher} = compileComplexPathResolver(path);
			this.equalityFn = equalityFn;
			this.parseSections = parseSections;
			//this.re_matcher = re_matcher;
		}
		// the true response handler handed down to the server
		this.handler = (userRequestData, userResponse) => {
			let { method, path } = userRequestData;
			let pathData = this.parseSections(path);
			let writer = method === "head" ? emptyResponseWriter : this.writer;
			// a handler has to take into account the `query` and `pathData` entry keys
			this.requestHandler({...userRequestData, pathData}, writer(userResponse));
		};
	}
	/**
	 * Convenience function for clarity on the router side
	 * @param {string} path the user request string
	 */
	matches(path) {
		return this.equalityFn(path);
	}
	_compareStringPaths(requestedPath) {
		requestedPath = requestedPath.replace(lastSlashDetector, "");
		return requestedPath === this.path;
	}
}

const lastSlashDetector = /\/+$/;

const complexPathDetector = /\{[a-z]\w*(:\w+)?\}/i;

const complexPathExtractor = /\/\{([a-z]\w*)(?::([a-z]+))?\}(\/|$)/i;

function isComplexPathString(path) {
	return complexPathDetector.test(path);
}

/**
 * Prepares the section attributes from the route path
 * @param {string} path the path string to process
 */
function compileComplexPathResolver(path) {
	//let re_str = path;
	// string regex that detects and splits an incoming request path
	let incomming_str = path;
	let offset = 0;
	// attribute sections collection for parsing value sections
	let valueSections = [];
	// iterator
	let section;
	// loop over re exec results until all parts have been found
	while (section = complexPathExtractor.exec(path.substring(offset))) {
		let {fullMatch, varName, varType, nextOffset} = translateSectionParams(section);
		let pathtTokenParams = pathTokenTypes[varType] || pathTokenTypes.default;
		offset += nextOffset;
		//re_str = re_str.replace(fullMatch, `/(${pathtTokenParams.regex})`);
		incomming_str = incomming_str.replace(fullMatch, `/([^/]+)`);
		valueSections.push({ ...pathtTokenParams, varName });
	}
	//let re_matcher = new RegExp(`^${re_str}/?$`);
	// will split the incoming path request into value sections
	let re_incommingSplitter = new RegExp(`^${incomming_str}/?$`);
	// convenience function for equality testing
	let equalityFn = path => re_incommingSplitter.test(path);
	// convenience method to parse value sections
	let parseSections = pathSectionParserGenerator(valueSections, re_incommingSplitter);
	return { equalityFn, parseSections };
	//return { equalityFn, parseSections, re_matcher };
}

/**
 * Translate the exec result for readability and setup the length for next exec
 * @param {array} section string array result comming from RegExp.exec
 */
function translateSectionParams(section) {
	// the whole match
	let fullMatch = section[0];
	// when /{name:type} -> name
	let varName = section[1];
	// when /{name:type} -> type || null
	let varType = section[2];
	// when /{name:type}/$ -> /
	let lastSlash = section[3];
	// when /static/{name:type} -> 8 (char index of start of match)
	let foundIndex = section.index;
	// when /static/{name:type} -> 8 + 11 = 19 (char index of end of match)
	let nextOffset = foundIndex + fullMatch.length - (lastSlash||"").length;
	return {
		fullMatch,
		varName,
		varType,
		nextOffset
	};
}

/**
 * Generates a path handler that returns the hash map of path variables
 * @param {array} variableSectionAttributesList precompiled section parameters
 * @param {RegExp} re_pathSplitter splits a path into its value sections
 */
function pathSectionParserGenerator(variableSectionAttributesList, re_pathSplitter) {
	return path => {
		// split request path into value sections
		let variableParts = (re_pathSplitter.exec(path)||[]).slice(1);
		let mandatorySize = variableSectionAttributesList.length;
		// num value sections must be equal to expected sections
		if (variableParts.length !== mandatorySize) { throw BAD_PATH_VARNUM; }
		if (variableParts) {
			// return the hash
			return variableSectionAttributesList
				.map((sectionAttributes, i) => {// join value section with corresponding attributes
					return { ...sectionAttributes, pathPart:variableParts[i] };
				})
				.map((section) => {// extract and validate into k,v pairs
					let {isValid, filter, varName, pathPart} = section;
					if (!isValid(pathPart)) { throw BAD_PATH_VARTYPE; }
					return {k:varName, v:filter(pathPart)};
				})
				.reduce((p, c)=>{return (p[c.k] = c.v),p;}, Object.create(null));// save into hash
		}
		// warn the developers: something went wrong with the route pattern matching
		console.log('Something is wrong with the pathSectionParser');
		console.log('the path', path);
		console.log('the re_incomming', re_pathSplitter);
		console.log('the pieces', variableSectionAttributesList);
		return null;
	};
}

exports.Route = Route;
