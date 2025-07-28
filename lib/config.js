const { version } = require("../package.json");

const CONFIG = {
	MAX_DIFF_SIZE: 100000,
	MAX_FILES_IN_DIFF: 100,
	AI_MODEL: "claude-sonnet-4-0",
	MAX_TOKENS: 1024,
	VERSION: version,
};

const BINARY_FILE_PATTERNS = [
	/\.(jpg|jpeg|png|gif|bmp|ico|svg|pdf|zip|tar|gz|exe|dll|so|dylib)$/i,
	/package-lock\.json$/,
	/yarn\.lock$/,
	/\.min\.(js|css)$/,
	/node_modules\//,
	/dist\//,
	/build\//,
	/\.map$/,
];

module.exports = {
	CONFIG,
	BINARY_FILE_PATTERNS,
};
