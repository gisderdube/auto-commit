const { execSync } = require("node:child_process");

function stageAllChanges() {
	try {
		execSync("git add -A");
	} catch (error) {
		throw new Error(`Failed to stage changes: ${error.message}`);
	}
}

function getStagedDiff() {
	try {
		return execSync("git diff --staged").toString();
	} catch (error) {
		throw new Error(`Failed to get git diff: ${error.message}`);
	}
}

function commitChanges(message) {
	const sanitizedMessage = message.replace(/"/g, '\\"');
	try {
		execSync(`git commit -m "${sanitizedMessage}"`);
		return sanitizedMessage;
	} catch (error) {
		throw new Error(`Failed to commit changes: ${error.message}`);
	}
}

function pushChanges() {
	try {
		execSync("git push");
	} catch (error) {
		throw new Error(`Failed to push changes: ${error.message}`);
	}
}

module.exports = {
	stageAllChanges,
	getStagedDiff,
	commitChanges,
	pushChanges,
};
