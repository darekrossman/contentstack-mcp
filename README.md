<p align="center">
  <img src="assets/cs-logo.png" />
</p>



# Contentstack MCP Server
[![smithery badge](https://smithery.ai/badge/@darekrossman/contentstack-mcp)](https://smithery.ai/server/@darekrossman/contentstack-mcp)

This Model Context Protocol (MCP) server integrates with Contentstack's Content Management API, enabling AI assistants like Claude to interact with your Contentstack CMS through a standardized protocol.

> **Note:** This is an early version of Contentstack MCP Server. Features and APIs are subject to change. See the [Roadmap](#roadmap) for upcoming improvements and planned features.

## Features

### Resources
- **`content-types`**: Retrieves a list of all content types in the stack. (URI: `contentstack://content-types`)
- **`content-type`**: Retrieves a specific content type by its UID. (URI Template: `contentstack://content-type/{uid}`)
- **`entries`**: Retrieves all entries for a specific content type. (URI Template: `contentstack://entries/{content_type_uid}`)
- **`entry`**: Retrieves a specific entry by its UID and content type UID. (URI Template: `contentstack://entry/{content_type_uid}/{entry_uid}`)
- **`assets`**: Retrieves a list of all assets in the stack. (URI: `contentstack://assets`)

### Tools
- **`create_content_type`**: Creates a new content type with the specified schema, options, field rules, and taxonomies.
- **`update_content_type`**: Updates an existing content type identified by its UID. Allows modification of title, schema, options, and field rules.
- **`delete_content_type`**: Deletes a content type identified by its UID.
- **`create_entry`**: Creates a new entry for a specified content type.
- **`update_entry`**: Updates an existing entry identified by its UID and content type UID.
- **`delete_entry`**: Deletes an entry identified by its UID and content type UID.
- **`get_content_type`**: Retrieves a specific content type by its UID, optionally including the global field schema.
- **`get_all_content_types`**: Retrieves a list of all content types, with options for pagination and including additional details like global field schema and counts.
- **`get_entry`**: Retrieves a specific entry by its content type UID and entry UID, with options for locale and including references.
- **`get_entries`**: Retrieves entries for a specified content type, with extensive options for filtering, sorting, pagination, and including related data.
- **`publish_entry`**: Publishes an entry to a specified environment and locale.
- **`unpublish_entry`**: Unpublishes an entry from a specified environment and locale.
- **`create_global_field`**: Creates a new global field with the specified title, UID, and schema.
- **`update_global_field`**: Updates an existing global field identified by its UID. Allows modification of title and schema.
- **`get_all_global_fields`**: Retrieves a list of all global fields, with options for pagination and including branch information.

### Prompts
- **`create_content_workflow`**: Initiates a guided workflow for creating new content for a specified content type.
- **`content_analysis`**: Initiates an analysis of content within a specified content type, providing insights and patterns.
- **`migration_planning`**: Initiates a planning process for migrating content to Contentstack, guiding through key considerations.

## Setup

### Prerequisites
- Node.js (v16.0.0 or higher)
- A Contentstack account
- API credentials (API Key and Management Token)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/contentstack-mcp.git
   cd contentstack-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your Contentstack credentials:
   ```
   CONTENTSTACK_API_KEY=your_api_key_here
   CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token_here
   # Optional: Specify branch if using branches
   CONTENTSTACK_BRANCH=your_branch_name
   ```

4. Build the server:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

For development, you can use:
```bash
npm run dev
```

## Code Quality

This project uses [Biome.js](https://biomejs.dev/) for linting and formatting. It provides a consistent code style and helps catch potential issues early.

### Available Commands

- **Lint Code**: Check your code for errors and style issues
  ```bash
  npm run lint
  ```

- **Lint and Fix**: Automatically fix linting issues when possible
  ```bash
  npm run lint:fix
  ```

- **Format Code**: Format your code without fixing linting issues
  ```bash
  npm run format
  ```

- **Format and Fix**: Apply code formatting and fix formatting issues
  ```bash
  npm run format:fix
  ```

## Integration with Claude

### Claude for Desktop

To use this server with Claude for Desktop:

1. Edit your Claude for Desktop configuration file:
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add this server to the `mcpServers` section:
   ```json
   {
     "mcpServers": {
       "contentstack": {
         "command": "node",
         "args": ["/absolute/path/to/contentstack-mcp/build/index.js"],
         "env": {
           "CONTENTSTACK_API_KEY": "your_api_key_here",
           "CONTENTSTACK_MANAGEMENT_TOKEN": "your_management_token_here"
         }
       }
     }
   }
   ```

3. Restart Claude for Desktop

### Claude Web Interface

For Claude web users, this server can be run locally and used with Claude when the appropriate API is available.

## Authentication

This server requires authentication with Contentstack's API:

**Management Token (Required)**:
- Stack-level token with predefined permissions
- Set via `CONTENTSTACK_MANAGEMENT_TOKEN` environment variable
- Generate this in the Contentstack dashboard under Settings > Tokens > Management Tokens

Both the API key and Management Token must be provided for the server to function properly.

## Usage Examples

Here are some examples of how to interact with your Contentstack CMS through Claude:

### Browsing Content Types
```
Show me all the content types in my Contentstack CMS.
```

### Retrieving Content
```
Get the entries for the 'blog_post' content type.
```

### Creating Content
```
Create a new blog post with the title "Summer Campaign Launch", summary "Launching our new summer collection", and author "Marketing Team".
```

### Updating Content Structure
```
Update my 'product' content type to add a 'related_products' field as a reference field that can contain multiple product entries.
```

### Managing Global Fields
```
Create a reusable "SEO Metadata" global field with title, description, and keywords fields.
```

### Publishing Content
```
Publish the blog post with UID 'summer-campaign-2023' to the 'production' environment.
```

## Advanced Configuration

### Working with Branches

If your Contentstack account uses branches, you can specify a branch:

```
CONTENTSTACK_BRANCH=develop
```

### Error Handling

The server includes comprehensive error handling with detailed error messages from the Contentstack API to help troubleshoot issues.

## API Reference

This server interacts with the Contentstack Content Management API. For detailed information about the underlying API endpoints, refer to the [Contentstack CMA documentation](https://www.contentstack.com/docs/developers/apis/content-management-api/).

## Troubleshooting

- **Authentication Errors**: Ensure your API key and management token are correct and have the necessary permissions
- **Resource Not Found**: Verify that the requested content type or entry exists
- **Permission Errors**: Check that your management token has the required permissions for the operation
- **Rate Limiting**: Be aware of API rate limits when making multiple requests

## Roadmap

The following checklist outlines planned and desirable features to enhance this MCP server, focusing on core functionalities expected in modern MCP implementations:

- [ ] **Enhanced AI Contextual Understanding**: Improve how the MCP server provides context to the AI, potentially including more metadata or related content snippets to aid in complex queries and multi-turn conversations.
- [ ] **Advanced Querying & Filtering**: Introduce more sophisticated ways to query entries and assets, such as filtering by multiple criteria, date ranges, or custom field values directly through AI prompts.
- [ ] **Workflow & Publishing Automation**: Enable AI-driven actions for content workflows, like initiating review processes, scheduling publishing, or managing content stages.
- [ ] **Asset Management Enhancements**: Beyond browsing, allow for more direct asset manipulation via AI, such as uploading assets, updating metadata, or organizing assets into folders.
- [ ] **Bulk Operations Support**: Implement capabilities for performing actions on multiple entries or assets at once (e.g., batch publish, batch delete, batch tag).
- [ ] **Improved Error Handling & AI Feedback**: Refine error messages to be more AI-friendly, providing clearer feedback that helps the AI understand and correct its requests.
- [ ] **User-Specific Context & Permissions**: Explore ways to tailor responses and available actions based on the AI user's (or the underlying human user's) permissions within Contentstack.
- [ ] **Extensibility for Custom Tools**: Design a more straightforward way to add custom tools or extend existing ones, allowing developers to tailor the MCP to specific project needs.
- [ ] **Real-time Event Handling (Optional)**: Investigate potential for handling Contentstack webhooks to enable more reactive AI behaviors (e.g., notifying the AI of content changes).
- [ ] **Comprehensive Documentation for AI Interaction**: Develop detailed guides on how to best formulate prompts and interact with the MCP for optimal results.

## License

MIT
