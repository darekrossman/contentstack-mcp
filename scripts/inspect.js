#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = resolve(__dirname, "../bin/mcp-server.js");

const args = ["npx", "@modelcontextprotocol/inspector", "node", serverPath];


if (process.env.CONTENTSTACK_API_KEY) {
  args.push(`--headers=${process.env.CONTENTSTACK_API_KEY}`);
}

if (process.env.CONTENTSTACK_MANAGEMENT_TOKEN) {
  args.push(`--headers=${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`);
}

// Execute the command
import { spawn } from "child_process";
const inspect = spawn(args[0], args.slice(1), { stdio: "inherit" });

inspect.on("error", (err) => {
  console.error("Failed to start inspector:", typeof err === 'object' ? JSON.stringify(err, null, 2) : err);
  process.exit(1);
});

inspect.on("exit", (code) => {
  process.exit(code || 0);
});