#!/usr/bin/env node

async function main() {
	// Required: Contentstack API Key
	const apiKeyIndex = process.argv.findIndex(
		(arg) => arg === "--api-key",
	);
	if (apiKeyIndex !== -1 && process.argv[apiKeyIndex + 1]) {
		process.env.CONTENTSTACK_API_KEY = process.argv[apiKeyIndex + 1];
	}

	// Required: Contentstack Management Token
	const tokenIndex = process.argv.findIndex(
		(arg) => arg === "--management-token",
	);
	if (tokenIndex !== -1 && process.argv[tokenIndex + 1]) {
		process.env.CONTENTSTACK_MANAGEMENT_TOKEN = process.argv[tokenIndex + 1];
	}

	// Optional: Contentstack Branch
	const branchIndex = process.argv.findIndex((arg) => arg === "--branch");
	if (branchIndex !== -1 && process.argv[branchIndex + 1]) {
		process.env.CONTENTSTACK_BRANCH = process.argv[branchIndex + 1];
	}

	// Display help message if --help flag is provided
	if (process.argv.includes("--help") || process.argv.includes("-h")) {
		console.log(`
Contentstack MCP Server

Usage:
  contentstack-mcp [options]

Required options:
  --api-key <key>             Contentstack API Key
  --management-token <token>  Contentstack Management Token

Optional options:
  --branch <branch>           Contentstack branch name (if using branches)
  -h, --help                  Show this help message

Environment variables:
  CONTENTSTACK_API_KEY         Alternative to --api-key
  CONTENTSTACK_MANAGEMENT_TOKEN Alternative to --management-token
  CONTENTSTACK_BRANCH          Alternative to --branch
`);
		process.exit(0);
	}

	// Validate required environment variables
	if (!process.env.CONTENTSTACK_API_KEY || !process.env.CONTENTSTACK_MANAGEMENT_TOKEN) {
		console.error("Error: Missing required environment variables.");
		console.error("Please provide both CONTENTSTACK_API_KEY and CONTENTSTACK_MANAGEMENT_TOKEN");
		console.error("either as environment variables or through command line arguments:");
		console.error("  --api-key <key> --management-token <token>");
		console.error("\nRun with --help for more information.");
		process.exit(1);
	}

	// Import and run the bundled server after env vars are set
	await import("../dist/bundle.js");
}

main().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});