
import { jsonResponseWriter } from "./responseWriters";

export class Route {
	constructor(requiresEncryption, path, requestHandler, responseWriter) {
		this.requiresEncryption = requiresEncryption;
		this.path = path.replace(lastSlashDetector, '');
		this.isComplex = isComplexPathString(path);
		this.requestHandler = requestHandler;
		this.parseSections = () => ({});
		this.writer = responseWriter || jsonResponseWriter;
		if (this.isComplex) {
			let {equalityFn, parseSections} = compileComplexPathResolver(path);
			this.equalityFn = equalityFn;
			this.parseSections = parseSections;
		} else {
			this.equalityFn = compareStringPaths;
		}
		this.responseHandler = (userRequestData, userResponse) => {
			let sectionData = this.parseSections(userRequestData.path);
			this.requestHandler({...userRequestData, sectionData}, this.writer(userResponse));
		};
	}
	matches(path) {
		return this.equalityFn(path);
	}
	getRequestStringVariables(requestPath) {
		return this.isComplex ? this.parseSections(requestPath) : {};
	}
}

const identityFn = v => v;
const alwaysTrue = () => true;

const lastSlashDetector = /\/+$/;

const complexPathDetector = /\{[a-z]\w*(:\w+)?\}/i;

const complexPathExtractor = /\/\{([a-z]\w*)(?::([a-z]+))?\}(\/|$)/i;

const numberValidator = /^(+|-)?(0|([1-9]\d+))$/;
const numberRegexStr = '(?:+|-)?(?:0|(?:[1-9]\d+))';

const wordValidator = /^[a-z]\w*$/i;
const wordRegexStr = '[a-zA-Z][a-zA-Z_]';

function compareStringPaths(storedPath, requestedPath) {
	let requestedPath = requestedPath.replace(lastSlashDetector, '');
	return requestedPath === storedPath;
}

function isComplexPathString(path) {
	return complexPathDetector.test(path);
}

function compileComplexPathResolver(path) {
	let re_str = path;
	let offset = 0;
	let variableSections = [];
	let section;
	while (section = complexPathExtractor.exec(path.substring(offset))) {
		let {fullMatch, varName, varType, nextOffset} = translateSectionParams(section)
		let pathtTokenParams = pathTokenTypes[varType] || pathTokenTypes['string'];
		offset += nextOffset;
		re_str = re_str.replace(fullMatch, pathtTokenParams.regex);
		variableSections.push({ ...pathtTokenParams, varName });
	}
	let re_matcher = new RegExp(`^${re_str}$`);
	let equalityFn = path => re_matcher.test(path);
	let parseSections = sectionParserGenerator(variableSections);
	return { equalityFn, parseSections };
}

function translateSectionParams(section) {
	let fullMatch = section[0];
	let varName = section[1];
	let varType = section[2];
	let lastSlash = section[3];
	let foundIndex = section.index;
	let nextOffset = foundIndex + fullMatch.length - (lastSlash||'').length;
	return {
		fullMatch,
		varName,
		varType,
		lastSlash,
		foundIndex,
		nextOffset
	};
}

function sectionParserGenerator(pieces) {
	return path => {
		let variables = {};
		let parts = complexPathExtractor.exec(path).slice(1);
		parts.forEach((part, i) => appendVariable(part, pieces[i]));
		return variables;
		function appendVariable(part, piece) {
			let {isValid, filter, varName} = piece;
			if (!isValid(part)) { throw 400; }
			variables[varName] = filter(part);
		}
	};
}

const pathTokenTypes = {
	'string': {
		type: 'string',
		regex: '[^/{}]+',
		isValid: alwaysTrue,
		filter: identityFn,
	},
	'word': {
		type: 'word',
		regex: wordRegexStr,
		isValid: v => wordValidator.test(v),
		filter: identityFn,
	},
	'number': {
		type: 'number',
		regex: numberRegexStr,
		isValid: v => numberValidator.test(v),
		filter: v => parseInt(v, 10),
	}
}
