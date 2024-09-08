#!/bin/bash

function auto_commit() {
    # Check if ANTHROPIC_API_KEY is set
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "Error: ANTHROPIC_API_KEY is not set. Please set it in your environment."
        return 1
    fi

    # Get the current git diff
    diff_output=$(git diff)

    # Check if there are any changes
    if [ -z "$diff_output" ]; then
        echo "No changes to commit."
        return 0
    fi

    # Use Claude API to summarize the changes
    summary=$(curl https://api.anthropic.com/v1/messages \
        -H "Content-Type: application/json" \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -d '{
        "model": "claude-3-sonnet-20240229",
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": "Please summarize the following git diff in a concise commit message format:\n\n'"$diff_output"'"
            }
        ]
    }' | jq -r '.content')

    # Commit the changes with the generated summary
    git commit -am "$summary"

    # Push the changes
    git push

    echo "Changes committed and pushed with the following summary:"
    echo "$summary"
}