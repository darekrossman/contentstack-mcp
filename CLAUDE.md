# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Contentstack MCP Server is a Model Context Protocol server that integrates with Contentstack's Content Management API. It enables AI assistants like Claude to interact with Contentstack CMS through a standardized protocol.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build the project
npm run build

# Clean build artifacts
npm run clean

# Start the server (after building)
npm start

# Code Quality
npm run lint       # Check and fix code with Biome
npm run typecheck  # Type check with TypeScript
```

## Architecture

The project is a TypeScript application structured around the Model Context Protocol (MCP):

1. **Server Definition** (`src/index.ts`): Creates and configures the MCP server with resources, tools, and prompts.

2. **Type Definitions** (`src/types.ts`): TypeScript interfaces for Contentstack API requests and responses.

3. **Main Components**:
   - **Resources**: URI-based endpoints to fetch content from Contentstack
   - **Tools**: Functions to perform operations on Contentstack content
   - **Prompts**: Guided workflows for content operations

4. **Configuration**:
   - The server requires Contentstack API credentials (API Key and Management Token)
   - Credentials are loaded from environment variables
   - Optional branch specification for multi-branch setups

5. **Build System**:
   - Uses esbuild (`lib/build.js`) to bundle the application
   - Outputs to `dist/bundle.js`

## Environment Variables and CLI Options

Required environment variables:
- `CONTENTSTACK_API_KEY`: Your Contentstack stack API key
- `CONTENTSTACK_MANAGEMENT_TOKEN`: Management token with necessary permissions

Optional environment variables:
- `CONTENTSTACK_BRANCH`: Branch name (if using branches)

### Command Line Usage

The server can be run directly via CLI with the following options:

```bash
contentstack-mcp [options]
```

Required options:
- `--api-key <key>`: Contentstack API Key
- `--management-token <token>`: Contentstack Management Token

Optional options:
- `--branch <branch>`: Contentstack branch name (if using branches)
- `-h, --help`: Show help message

## Code Style Guidelines

The project uses Biome for code style and quality standards:

1. **Formatting**:
   - Single quotes for strings
   - No semicolons
   - 2-space indentation
   - Trailing commas in multiline objects/arrays

2. **TypeScript**:
   - Explicit types for function parameters and return values
   - Interface-based type definitions
   - Zod schemas for validation

3. **API Handling**:
   - Axios for HTTP requests
   - Comprehensive error handling
   - Response formatting for user-friendly outputs

## Integration with Claude

The MCP server can be used with Claude for Desktop by updating the Claude Desktop configuration file to include this server in the `mcpServers` section. See the README.md for specific setup instructions.

## API Structure

The server interacts with Contentstack's Content Management API (base URL: https://api.contentstack.io/v3) with these main endpoints:

- Content Types: `/content_types/`
- Entries: `/content_types/{content_type_uid}/entries/`
- Global Fields: `/global_fields/`
- Assets: `/assets/`

Authentication is handled via API key and management token headers.