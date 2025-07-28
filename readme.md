# auto-commit-cli

Automatically commit and push changes using AI-generated commit messages.

NOTE: All files will be staged before the commit is made.

The Anthropic API is used to generate the commit message. Therefore, you will need to have an Anthropic API key.


## Installation

```bash
npm install -g auto-commit-cli
```

### Setting your Anthropic API key

```bash
### locally
export ANTHROPIC_API_KEY="xxx" # set your Anthropic API key

### in .zshrc or .bashrc
echo "export ANTHROPIC_API_KEY='xxx'" >> ~/.zshrc # or ~/.bashrc
source ~/.zshrc # or ~/.bashrc
```

## Usage

```bash
# this will stage all changes, generate a commit message and create a new commit with it
auto-commit
```

### Auto-push

```bash 
# same as base command, but pushes the newly created commit
auto-commit --push
```

### Preview the message
```bash
# only logs the generated commit message, no commit, no push
auto-commit --preview
```

### Adjust the prompt
```bash
export AUTO_COMMIT_PROMPT="Use present tense when creating the commit message."
```

### Optional: Create an alias

```bash
echo "alias ac='auto-commit'" >> ~/.zshrc # or ~/.bashrc
source ~/.zshrc # or ~/.bashrc

ac
```