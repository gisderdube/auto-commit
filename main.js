#!/usr/bin/env node

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
			`[auto-commit] Original diff: ${diffOutput.length} chars, filtered: ${filteredDiff.length} chars`,
		);

		const summary = await generateCommitMessage(filteredDiff);

		if (previewOnly) {
			console.log("[auto-commit] Preview mode - generated commit message:");
			console.log(`-> ${summary}`);
			return 0;
		}

		commitChanges(summary);
		console.log("[auto-commit] Changes committed with summary:");
		console.log(`-> ${summary}`);

		if (shouldPush) {
			pushChanges();
			console.log("[auto-commit] Changes pushed to remote repository.");
		} else {
			console.log(
				"[auto-commit] Use --push flag to push to remote repository.",
			);
		}

		return 0;
	} catch (error) {
		console.error(`[auto-commit] Error: ${error.message}`);
		return 1;
	}
}

module.exports = autoCommit;

if (require.main === module) {
	autoCommit().catch(console.error);
}
