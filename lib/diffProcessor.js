const { execSync } = require("node:child_process");
const { CONFIG, BINARY_FILE_PATTERNS } = require("./config");

function isBinaryOrGeneratedFile(diffLine) {
	return BINARY_FILE_PATTERNS.some((pattern) => pattern.test(diffLine));
}

function getDiffStats(diffOutput) {
	try {
		const statsOutput = execSync("git diff --staged --stat").toString();
		return statsOutput.trim();
	} catch (error) {
		const lines = diffOutput.split("\n");
		const additions = lines.filter((line) => line.startsWith("+")).length;
		const deletions = lines.filter((line) => line.startsWith("-")).length;
		return `${additions} additions, ${deletions} deletions`;
	}
}

function filterAndReduceDiff(diffOutput) {
	const lines = diffOutput.split("\n");
	const filteredLines = [];
	let currentFile = "";
	let skipCurrentFile = false;
	let fileCount = 0;

	for (const line of lines) {
		if (line.startsWith("diff --git")) {
			currentFile = line;
			skipCurrentFile = false;
			fileCount++;

			if (fileCount > CONFIG.MAX_FILES_IN_DIFF) {
				skipCurrentFile = true;
				continue;
			}

			if (isBinaryOrGeneratedFile(line)) {
				skipCurrentFile = true;
				continue;
			}
		}

		if (skipCurrentFile) continue;

		if (line.includes("Binary files") && line.includes("differ")) {
			continue;
		}

		if (
			line.startsWith("@@") ||
			line.startsWith("+++") ||
			line.startsWith("---") ||
			line.startsWith("diff --git") ||
			line.startsWith("+") ||
			line.startsWith("-") ||
			line.startsWith("index ")
		) {
			filteredLines.push(line);
		}
	}

	let result = filteredLines.join("\n");

	if (result.length > CONFIG.MAX_DIFF_SIZE) {
		const truncated = result.substring(0, CONFIG.MAX_DIFF_SIZE);
		const stats = getDiffStats(diffOutput);
		result = `${truncated}\n\n[TRUNCATED - Full stats: ${stats}]`;
	}

	return result;
}

module.exports = {
	filterAndReduceDiff,
	getDiffStats,
	isBinaryOrGeneratedFile,
};
