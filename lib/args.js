function parseArguments() {
	const args = process.argv.slice(2);
	const allArgs = process.argv.join(" ");

	return {
		shouldPush: args.includes("--push") || allArgs.includes("--push"),
		previewOnly: args.includes("--preview") || allArgs.includes("--preview"),
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
