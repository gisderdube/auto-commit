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
# this will stage all changes, generate a commit message and show a preview
# press Enter to create the commit or Escape to cancel
auto-commit
```

### Command Line Options

#### `--push`
```bash 
# same as base command with preview, but pushes the newly created commit to remote
auto-commit --push
```

#### `--no-preview`
```bash
# skips the preview confirmation and creates the commit immediately
auto-commit --no-preview
```

#### `--version` or `-v`
```bash
# displays the current version of auto-commit-cli
auto-commit --version
auto-commit -v
```

### Caching

The tool automatically caches commit messages based on the diff content. When you run the tool in preview mode (default behavior), the generated message is cached. If you then proceed with the commit or run the tool again with the same changes, it will use the cached message without making another API request.

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