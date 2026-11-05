function parseArguments() {
	const args = process.argv.slice(2);

	// Preview is now the default behavior, unless --no-preview is specified
	const noPreview = args.includes("--no-preview");

	return {
		shouldPush: args.includes("--push"),
		previewOnly: !noPreview, // Preview is default, disabled only with --no-preview
		stagedOnly: args.includes("--staged") || args.includes("-s"),
		showVersion: args.includes("-v") || args.includes("--version"),
	};
}

module.exports = {
	parseArguments,
};
