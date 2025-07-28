#!/usr/bin/env node

const { execSync } = require("node:child_process");
const Anthropic = require("@anthropic-ai/sdk");

async function autoCommit() {
	// Parse command line arguments
	const args = process.argv.slice(2);
	console.log("args:", args);
	const shouldPush = args.includes("--push");
	const previewOnly = args.includes("--preview");

	// Check if ANTHROPIC_API_KEY is set
	if (!process.env.ANTHROPIC_API_KEY) {
		console.error(
			"Error: ANTHROPIC_API_KEY is not set. Please set it in your environment.",
		);
		return 1;
	}

	// Initialize Anthropic client
	const anthropic = new Anthropic({
		apiKey: process.env.ANTHROPIC_API_KEY,
	});

	// Get the current git diff
	let diffOutput;
	try {
		execSync("git add -A");
		diffOutput = execSync("git diff --staged").toString();
	} catch (error) {
		console.error("Error getting git diff:", error.message);
		return 1;
	}

	// Check if there are any changes
	if (!diffOutput.trim()) {
		console.log("No changes to commit.");
		return 0;
	}

	const prompt = `I am working on a software project. 
    I want to summarize the following input into a commit message 
    that is no longer than 10 words. 
    Please summarize the following git diff in a concise message 
    that I can use as a commit message. 
    ${process.env.AUTO_COMMIT_PROMPT}
    Here is the git diff:\n\n${JSON.stringify(diffOutput)}`;

	// Use Claude API to summarize the changes
	let response;
	try {
		response = await anthropic.messages.create({
			model: "claude-3-5-sonnet-20241022",
			max_tokens: 1024,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		});
	} catch (error) {
		console.error("Error calling Claude API:", error.message);
		return 1;
	}

	const summary = response.content[0].text;

	// If preview mode, just show the commit message
	if (previewOnly) {
		console.log("[auto-commit] Preview mode - generated commit message:");
		console.log(`-> ${summary}`);
		return 0;
	}

	// Commit the changes with the generated summary
	try {
		execSync(`git commit -m "${summary}"`);
		console.log("[auto-commit] Changes committed with summary:");
		console.log(`-> ${summary}`);

		if (shouldPush) {
			execSync("git push");
			console.log("[auto-commit] Changes pushed to remote repository.");
		} else {
			console.log(
				"[auto-commit] Use --push flag to push to remote repository.",
			);
		}
	} catch (error) {
		console.error("Error committing or pushing changes:", error.message);
		return 1;
	}
}

// Export the function for use as a module
module.exports = autoCommit;

// Run the function if called directly
if (require.main === module) {
	autoCommit().catch(console.error);
}
