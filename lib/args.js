function parseArguments() {
	const args = process.argv.slice(2);
	const allArgs = process.argv.join(" ");

	// Preview is now the default behavior, unless --no-preview is specified
	const noPreview = args.includes("--no-preview") || allArgs.includes("--no-preview");

	return {
		shouldPush: args.includes("--push") || allArgs.includes("--push"),
		previewOnly: !noPreview, // Preview is default, disabled only with --no-preview
		showVersion:
			args.includes("-v") ||
			args.includes("--version") ||
			allArgs.includes("-v") ||
			allArgs.includes("--version"),
	};
}

module.exports = {
	parseArguments,
};
