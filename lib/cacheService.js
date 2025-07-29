const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const CACHE_DIR = path.join(os.tmpdir(), "auto-commit-cache");
const CACHE_FILE = path.join(CACHE_DIR, "commit-messages.json");

function ensureCacheDir() {
	if (!fs.existsSync(CACHE_DIR)) {
		fs.mkdirSync(CACHE_DIR, { recursive: true });
	}
}

function generateDiffHash(filteredDiff) {
	return crypto.createHash("sha256").update(filteredDiff).digest("hex");
}

function loadCache() {
	try {
		if (fs.existsSync(CACHE_FILE)) {
			const content = fs.readFileSync(CACHE_FILE, "utf8");
			return JSON.parse(content);
		}
	} catch (error) {
		// If cache is corrupted, start fresh
	}
	return {};
}

function saveCache(cache) {
	try {
		ensureCacheDir();
		fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
	} catch (error) {
		console.warn("[auto-commit-cli] Warning: Could not save cache:", error.message);
	}
}

function getCachedCommitMessage(filteredDiff) {
	const diffHash = generateDiffHash(filteredDiff);
	const cache = loadCache();
	return cache[diffHash] || null;
}

function setCachedCommitMessage(filteredDiff, commitMessage) {
	const diffHash = generateDiffHash(filteredDiff);
	const cache = loadCache();
	cache[diffHash] = commitMessage;
	saveCache(cache);
}

function clearOldCacheEntries() {
	try {
		const cache = loadCache();
		const now = Date.now();
		const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000); // 1 week in milliseconds
		
		let hasChanges = false;
		for (const [hash, entry] of Object.entries(cache)) {
			if (typeof entry === "object" && entry.timestamp < oneWeekAgo) {
				delete cache[hash];
				hasChanges = true;
			}
		}
		
		if (hasChanges) {
			saveCache(cache);
		}
	} catch (error) {
		// Ignore cleanup errors
	}
}

module.exports = {
	getCachedCommitMessage,
	setCachedCommitMessage,
	generateDiffHash,
	clearOldCacheEntries,
};