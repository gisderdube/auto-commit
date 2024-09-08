# auto-commit-cli

Automatically commit and push changes using AI-generated commit messages.

NOTE: All files will be staged before the commit is made.

The Anthropic API is used to generate the commit message. Therefore, you will need to have an Anthropic API key.


## Installation

```bash
npm install -g auto-commit-cli
```

## Usage

```bash
export ANTHROPIC_API_KEY="xxx" # set your Anthropic API key, ideally in your .zshrc or .bashrc
auto-commit
```

### Optional: Create an alias

```bash
echo "alias ac='auto-commit'" >> ~/.zshrc # or ~/.bashrc
source ~/.zshrc # or ~/.bashrc

ac
```