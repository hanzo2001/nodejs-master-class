
const identityFn = v => v;
const alwaysTrue = () => true;

const numberValidator = /^(\+|-)?(0|([1-9]\d+))$/;
const numberRegexStr = "(?:\\+|-)?(?:0|(?:[1-9]\\d+))";

const wordValidator = /^[a-z]\w*$/i;
const wordRegexStr = "[a-zA-Z][a-zA-Z_]";

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

pathTokenTypes.default = pathTokenTypes.string;

exports.pathTokenTypes = pathTokenTypes;
