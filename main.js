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
			`[auto-commit-cli] Original diff: ${diffOutput.length} chars, filtered: ${filteredDiff.length} chars`,
		);

		let summary;

		if (previewOnly) {
			summary = await generateCommitMessage(filteredDiff, true);
			console.log("[auto-commit-cli] Preview mode - generated commit message:");
			console.log(`-> ${summary}`);
			return 0;
		}

		summary = await generateCommitMessage(filteredDiff, true);
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
