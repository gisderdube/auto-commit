#!/usr/bin/env node

const { execSync } = require('child_process');
const axios = require('axios');
const { CLIENT_RENEG_LIMIT } = require('tls');

async function autoCommit() {
    // Check if ANTHROPIC_API_KEY is set
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error("Error: ANTHROPIC_API_KEY is not set. Please set it in your environment.");
        return 1;
    }
    // Get the current git diff
    let diffOutput;
    try {
        diffOutput = execSync('git diff').toString();
        console.log('DIFF OUTPUT:',diffOutput);
    } catch (error) {
        console.error("Error getting git diff:", error.message);
        return 1;
    }


    // Check if there are any changes
    if (!diffOutput.trim()) {
        console.log("No changes to commit.");
        return 0;
    }

    console.log("\n\n\n-----------------------------------\n\n\n");

    const prompt = `I am working on a software project. 
    I want to summarize the following input into a commit message 
    that is no longer than 10 words. 
    Please summarize the following git diff in a concise message 
    that I can use as a commit message. 
    Here is the git diff:\n\n${JSON.stringify(diffOutput)}`;

    console.log("PROMPT:", prompt);

    console.log("\n\n\n-----------------------------------\n\n\n");

    // Use Claude API to summarize the changes
    let response;
    try {
        response = await axios.post('https://api.anthropic.com/v1/messages', {
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            }
        });
    } catch (error) {
        console.error("Error calling Claude API:", error.message);
        return 1;
    }

    console.log("\n\n\n-----------------------------------\n\n\n");
    console.log(response.data);
    console.log("\n\n\n-----------------------------------\n\n\n");

    const summary = response.data.content[0].text;
    console.log(summary);
    console.log("\n\n\n-----------------------------------\n\n\n");

    // Commit the changes with the generated summary
    try {
        execSync('git add -A');
        execSync(`git commit -am "${summary}"`);
        execSync('git push');
    } catch (error) {
        console.error("Error committing or pushing changes:", error.message);
        return 1;
    }

    console.log("Changes committed and pushed with the following summary:");
    console.log(summary);
}

// Export the function for use as a module
module.exports = autoCommit;

// Run the function if called directly
if (require.main === module) {
    autoCommit().catch(console.error);
}