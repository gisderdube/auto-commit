const Anthropic = require("@anthropic-ai/sdk");
const { CONFIG } = require("./config");

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
    that I can use as a commit message. 
    ${customPrompt}
    Here is the git diff:\n\n${filteredDiff}`;
}

async function generateCommitMessage(filteredDiff) {
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

		return response.content[0].text.trim();
	} catch (error) {
		throw new Error(`Failed to generate commit message: ${error.message}`);
	}
}

module.exports = {
	validateApiKey,
	generateCommitMessage,
};
