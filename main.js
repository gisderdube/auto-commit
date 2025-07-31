#!/usr/bin/env node

const readline = require("readline");
const { CONFIG } = require("./lib/config");
const { parseArguments } = require("./lib/args");
const { filterAndReduceDiff } = require("./lib/diffProcessor");
const {
	stageAllChanges,
	getStagedDiff,
	commitChanges,
	pushChanges,
} = require("./lib/gitService");
const { validateApiKey, generateCommitMessage } = require("./lib/aiService");

function promptForEnter() {
	return new Promise((resolve, reject) => {
		console.log(
			"\n\nPress \x1b[1mEnter\x1b[0m to commit the changes or \x1b[1mEsc\x1b[0m to cancel...",
		);

		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.setEncoding("utf8");

		const onData = (key) => {
			if (key === "\r" || key === "\n") {
				// Enter key pressed
				cleanup();
				resolve(true);
			} else if (key === "\u001b") {
				// Escape key pressed
				cleanup();
				resolve(false);
			} else if (key === "\u0003") {
				// Ctrl+C pressed
				cleanup();
				process.exit(0);
			}
		};

		const cleanup = () => {
			process.stdin.setRawMode(false);
			process.stdin.pause();
			process.stdin.removeListener("data", onData);
		};

		process.stdin.on("data", onData);
	});
}

async function autoCommit() {
	try {
		const { shouldPush, previewOnly, showVersion } = parseArguments();

		if (showVersion) {
			console.log(`auto-commit-cli v${CONFIG.VERSION}`);
			return 0;
		}

		validateApiKey();

		stageAllChanges();
		const diffOutput = getStagedDiff();

		if (!diffOutput.trim()) {
			console.log("No changes to commit.");
			return 0;
		}

		const filteredDiff = filterAndReduceDiff(diffOutput);
		console.log(
			`[auto-commit-cli] Original diff: ${diffOutput.length} chars, filtered: ${filteredDiff.length} chars`,
		);

		let summary;

		if (previewOnly) {
			summary = await generateCommitMessage(filteredDiff, true);
			console.log("[auto-commit-cli] generated commit message:");
			console.log(`\n\x1b[1m${summary}\x1b[0m`);
			const shouldProceed = await promptForEnter();

			if (!shouldProceed) {
				console.log("[auto-commit-cli] Commit cancelled.");
				return 0;
			}
		}

		if (!summary) {
			summary = await generateCommitMessage(filteredDiff, true);
		}

		commitChanges(summary);
		console.log("[auto-commit-cli] Changes committed with summary:");
		console.log(`-> ${summary}`);

		if (shouldPush) {
			pushChanges();
			console.log("[auto-commit-cli] Changes pushed to remote repository.");
		} else {
			console.log(
				"[auto-commit-cli] Use --push flag to push to remote repository.",
			);
		}

		return 0;
	} catch (error) {
		console.error(`[auto-commit-cli] Error: ${error.message}`);
		return 1;
	}
}

module.exports = autoCommit;

if (require.main === module) {
	autoCommit().catch(console.error);
}
