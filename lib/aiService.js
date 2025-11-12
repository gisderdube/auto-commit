const Anthropic = require("@anthropic-ai/sdk");
const { CONFIG } = require("./config");
const {
	getCachedCommitMessage,
	setCachedCommitMessage,
} = require("./cacheService");

function validateApiKey() {
	if (!process.env.ANTHROPIC_API_KEY) {
		throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
	}
}

function createAnthropicClient() {
	validateApiKey();
	return new Anthropic({
		apiKey: process.env.ANTHROPIC_API_KEY,
	});
}

function buildPrompt(filteredDiff) {
	const customPrompt = process.env.AUTO_COMMIT_PROMPT || "";
	return `I am working on a software project. 
    I want to summarize the following input into a commit message 
    that is no longer than 10 words. 
    Please summarize the following git diff in a concise message 
    that I can use as a commit message. just return the commit message, no other text, no markdown, no code blocks, no formatting, unless explicitly requested.
		Use present tense when creating the commit message. No punctuation at the end of the message. Use lower case for sentences and list starts. Add 1-3 lines with key changes made, if it is necessary (if so, add them as list right below the main commit message).
    ${customPrompt}
    Here is the git diff:\n\n${filteredDiff}`;
}

async function generateCommitMessage(filteredDiff, useCache = false) {
	if (useCache) {
		const cached = getCachedCommitMessage(filteredDiff);
		if (cached) {
			return cached;
		}
	}

	const anthropic = createAnthropicClient();
	const prompt = buildPrompt(filteredDiff);

	try {
		const response = await anthropic.messages.create({
			model: CONFIG.AI_MODEL,
			max_tokens: CONFIG.MAX_TOKENS,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		});

		const commitMessage = response.content[0].text.trim().replace(/```/g, "");

		setCachedCommitMessage(filteredDiff, commitMessage);

		return commitMessage;
	} catch (error) {
		throw new Error(`Failed to generate commit message: ${error.message}`);
	}
}

module.exports = {
	validateApiKey,
	generateCommitMessage,
};
