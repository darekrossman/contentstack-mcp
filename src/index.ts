// Contentstack MCP Server
// This server integrates with Contentstack's Content Management API
// to provide resources and tools for managing content types and entries

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// API configuration
const API_BASE_URL = "https://api.contentstack.io/v3";
const API_KEY = process.env.CONTENTSTACK_API_KEY || "";
const MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN || "";
const BRANCH = process.env.CONTENTSTACK_BRANCH || "";

// Authentication headers
const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    api_key: API_KEY,
  };

  // Use management token
  if (MANAGEMENT_TOKEN) {
    headers["authorization"] = MANAGEMENT_TOKEN;
  }

  // Include branch header if specified
  if (BRANCH) {
    headers["branch"] = BRANCH;
  }

  return headers;
};

// Create MCP server
const server = new McpServer({
  name: "contentstack-mcp-server",
  version: "1.0.0"
});

// Error handler helper
const handleError = (error: any): string => {
  if (error.response) {
    return `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
  } else if (error.request) {
    return `No response received: ${error.request}`;
  } else {
    return `Error: ${error.message}`;
  }
};

// ==========================================
// RESOURCES
// ==========================================

// Content Types Resource
server.resource("content-types", "contentstack://content-types", async (uri) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/content_types`, {
      headers: getHeaders(),
    });

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(response.data.content_types, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: uri.href,
          text: handleError(error),
          mimeType: "text/plain",
        },
      ],
    };
  }
});

// Content Type by UID Resource
server.resource(
  "content-type",
  new ResourceTemplate("contentstack://content-type/{uid}", { list: undefined }),
  async (uri, { uid }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/content_types/${uid}`, {
        headers: getHeaders(),
      });

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data.content_type, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: handleError(error),
            mimeType: "text/plain",
          },
        ],
      };
    }
  }
);

// Entries by Content Type Resource
server.resource(
  "entries",
  new ResourceTemplate("contentstack://entries/{content_type_uid}", { list: undefined }),
  async (uri, { content_type_uid }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries`,
        {
          headers: getHeaders(),
        }
      );

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data.entries, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: handleError(error),
            mimeType: "text/plain",
          },
        ],
      };
    }
  }
);

// Entry by UID Resource
server.resource(
  "entry",
  new ResourceTemplate("contentstack://entry/{content_type_uid}/{entry_uid}", {
    list: undefined,
  }),
  async (uri, { content_type_uid, entry_uid }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries/${entry_uid}`,
        {
          headers: getHeaders(),
        }
      );

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data.entry, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: handleError(error),
            mimeType: "text/plain",
          },
        ],
      };
    }
  }
);

// Assets Resource
server.resource("assets", "contentstack://assets", async (uri) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assets`, {
      headers: getHeaders(),
    });

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(response.data.assets, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: uri.href,
          text: handleError(error),
          mimeType: "text/plain",
        },
      ],
    };
  }
});

// ==========================================
// TOOLS
// ==========================================

// Create Content Type
server.tool(
  "create_content_type",
  {
    title: z.string().describe("Content type title"),
    uid: z.string().describe("Content type UID (unique identifier)"),
    schema: z
      .array(z.object({}).passthrough())
      .describe(
        "Array of schema fields defining the content structure. Each field object should include properties like:\n- display_name: Field display name\n- uid: Unique identifier for the field\n- data_type: Type of data (text, number, boolean, file, etc.)\n- field_metadata: Additional metadata for the field\n- multiple: Whether field accepts multiple values\n- mandatory: Whether field is required\n- unique: Whether field values must be unique"
      ),
    options: z
      .object({
        is_page: z
          .boolean()
          .optional()
          .describe("Set to true for webpage content types, false for content blocks"),
        singleton: z
          .boolean()
          .optional()
          .describe("Set to true for single content types, false for multiple"),
        title: z.string().optional().describe("Field to use as the title"),
        sub_title: z.array(z.string()).optional().describe("Fields to use as subtitles"),
        url_pattern: z.string().optional().describe("Default URL pattern for entries"),
        url_prefix: z.string().optional().describe("Path prefix for entries"),
      })
      .optional()
      .describe(
        "Content type options like webpage/content block settings and URL patterns"
      ),
    field_rules: z
      .array(
        z.object({
          conditions: z.array(
            z.object({
              operand_field: z.string().describe("Field on which to apply condition"),
              operator: z
                .string()
                .describe("Operator for condition (e.g., equals, contains)"),
              value: z.any().describe("Expected value for the condition"),
            })
          ),
          actions: z.array(
            z.object({
              action: z.string().describe("Action to perform (show/hide)"),
              target_field: z.string().describe("Field to show/hide based on condition"),
            })
          ),
          match_type: z.string().describe("Whether all or any conditions should be met"),
        })
      )
      .optional()
      .describe("Field visibility rules for showing/hiding fields based on conditions"),
    taxonomies: z
      .array(
        z.object({
          taxonomy_uid: z.string().describe("Taxonomy UID to link"),
          max_terms: z
            .number()
            .optional()
            .describe("Maximum number of terms allowed (up to 25)"),
          mandatory: z.boolean().optional().describe("Whether this taxonomy is required"),
          non_localizable: z
            .boolean()
            .optional()
            .describe("Whether this taxonomy is non-localizable"),
        })
      )
      .optional()
      .describe("Taxonomies to associate with this content type"),
  },
  async ({ title, uid, schema, options, field_rules, taxonomies }) => {
    try {
      // Prepare the content type payload
      const payload: any = {
        content_type: {
          title,
          uid,
          schema,
          options: options || {
            is_page: true,
            singleton: false,
            title: "title",
            sub_title: [],
            url_pattern: "/:title",
            url_prefix: "/",
          },
        },
      };

      // Add field_rules if provided
      if (field_rules && field_rules.length > 0) {
        payload.content_type.field_rules = field_rules;
      }

      // Add taxonomies if provided
      if (taxonomies && taxonomies.length > 0) {
        // Add the taxonomies field to the content_type object directly, not in schema
        payload.content_type.taxonomies = taxonomies;
      }

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`${API_BASE_URL}/content_types`, payload, {
        headers: getHeaders(),
      });

      console.log("API response:", response.data);

      return {
        content: [
          {
            type: "text",
            text: `Content type "${title}" created successfully with UID "${uid}".`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = handleError(error);
      return {
        content: [
          {
            type: "text",
            text: `Error creating content type: ${errorMessage}\n\nPlease ensure your schema adheres to the Contentstack schema specification. Schema should be an array of field objects. Example field objects:

// Title field example
{
  "display_name": "Title",
  "uid": "title",
  "data_type": "text",
  "mandatory": true,
  "unique": true,
  "field_metadata": {
    "_default": true
  },
  "multiple": false
}

// Rich text editor example
{
  "display_name": "Description",
  "uid": "description",
  "data_type": "text",
  "field_metadata": {
    "allow_rich_text": true,
    "description": "",
    "multiline": false,
    "rich_text_type": "advanced"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false
}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Update Content Type
server.tool(
  "update_content_type",
  {
    uid: z.string().describe("Content type UID to update"),
    title: z.string().optional().describe("New content type title"),
    schema: z
      .array(z.object({}).passthrough())
      .optional()
      .describe(
        "Array of schema fields defining the content structure. Each field object should include properties like:\n- display_name: Field display name\n- uid: Unique identifier for the field\n- data_type: Type of data (text, number, boolean, file, etc.)\n- field_metadata: Additional metadata for the field\n- multiple: Whether field accepts multiple values\n- mandatory: Whether field is required\n- unique: Whether field values must be unique"
      ),
    options: z
      .object({
        is_page: z
          .boolean()
          .optional()
          .describe("Set to true for webpage content types, false for content blocks"),
        singleton: z
          .boolean()
          .optional()
          .describe("Set to true for single content types, false for multiple"),
        title: z.string().optional().describe("Field to use as the title"),
        sub_title: z.array(z.string()).optional().describe("Fields to use as subtitles"),
        url_pattern: z.string().optional().describe("Default URL pattern for entries"),
        url_prefix: z.string().optional().describe("Path prefix for entries"),
      })
      .optional()
      .describe(
        "Content type options like webpage/content block settings and URL patterns"
      ),
    field_rules: z
      .array(
        z.object({
          conditions: z.array(
            z.object({
              operand_field: z.string().describe("Field on which to apply condition"),
              operator: z
                .string()
                .describe("Operator for condition (e.g., equals, contains)"),
              value: z.any().describe("Expected value for the condition"),
            })
          ),
          actions: z.array(
            z.object({
              action: z.string().describe("Action to perform (show/hide)"),
              target_field: z.string().describe("Field to show/hide based on condition"),
            })
          ),
          match_type: z.string().describe("Whether all or any conditions should be met"),
        })
      )
      .optional()
      .describe("Field visibility rules for showing/hiding fields based on conditions"),
  },
  async ({ uid, title, schema, options, field_rules }) => {
    try {
      // First fetch existing content type
      const fetchResponse = await axios.get(`${API_BASE_URL}/content_types/${uid}`, {
        headers: getHeaders(),
      });

      const existingContentType = fetchResponse.data.content_type;

      // Prepare update payload
      const payload = {
        content_type: {
          ...existingContentType,
          title: title || existingContentType.title,
          schema: schema || existingContentType.schema,
        },
      };

      // Update options if provided
      if (options) {
        payload.content_type.options = {
          ...existingContentType.options,
          ...options,
        };
      }

      // Update field_rules if provided
      if (field_rules) {
        payload.content_type.field_rules = field_rules;
      }

      // Update content type
      const response = await axios.put(`${API_BASE_URL}/content_types/${uid}`, payload, {
        headers: getHeaders(),
      });

      return {
        content: [
          {
            type: "text",
            text: `Content type "${uid}" updated successfully.`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = handleError(error);
      return {
        content: [
          {
            type: "text",
            text: `Error updating content type: ${errorMessage}\n\nPlease ensure your schema adheres to the Contentstack schema specification. Schema should be an array of field objects. Example field objects:

// Single line text field example
{
  "display_name": "Field Name",
  "uid": "field_uid",
  "data_type": "text",
  "field_metadata": {
    "description": "Field description"
  },
  "multiple": false,
  "mandatory": false,
  "unique": false
}

// Select field example
{
  "display_name": "Category",
  "uid": "category",
  "data_type": "text",
  "display_type": "dropdown",
  "enum": {
    "advanced": false,
    "choices": [
      {"value": "Technology"},
      {"value": "Finance"},
      {"value": "Health"}
    ]
  },
  "multiple": true,
  "mandatory": false,
  "unique": false
}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Delete Content Type
server.tool(
  "delete_content_type",
  {
    uid: z.string().describe("Content type UID to delete"),
  },
  async ({ uid }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/content_types/${uid}`, {
        headers: getHeaders(),
      });

      return {
        content: [
          {
            type: "text",
            text: `Content type "${uid}" deleted successfully.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: handleError(error),
          },
        ],
        isError: true,
      };
    }
  }
);

// Create Entry
server.tool(
  "create_entry",
  {
    content_type_uid: z.string().describe("Content type UID"),
    entry: z
      .object({})
      .passthrough()
      .describe("Entry data according to content type schema"),
  },
  async ({ content_type_uid, entry }) => {
    try {
      const payload = { entry };

      const response = await axios.post(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries`,
        payload,
        {
          headers: getHeaders(),
        }
      );

      return {
        content: [
          {
            type: "text",
            text: `Entry created successfully in content type "${content_type_uid}". Entry UID: ${response.data.entry.uid}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: handleError(error),
          },
        ],
        isError: true,
      };
    }
  }
);

// Update Entry
server.tool(
  "update_entry",
  {
    content_type_uid: z.string().describe("Content type UID"),
    entry_uid: z.string().describe("Entry UID to update"),
    entry: z.object({}).passthrough().describe("Updated entry data"),
  },
  async ({ content_type_uid, entry_uid, entry }) => {
    try {
      const payload = { entry };

      const response = await axios.put(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries/${entry_uid}`,
        payload,
        {
          headers: getHeaders(),
        }
      );

      return {
        content: [
          {
            type: "text",
            text: `Entry "${entry_uid}" updated successfully in content type "${content_type_uid}".`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: handleError(error),
          },
        ],
        isError: true,
      };
    }
  }
);

// Delete Entry
server.tool(
  "delete_entry",
  {
    content_type_uid: z.string().describe("Content type UID"),
    entry_uid: z.string().describe("Entry UID to delete"),
  },
  async ({ content_type_uid, entry_uid }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries/${entry_uid}`,
        {
          headers: getHeaders(),
        }
      );

      return {
        content: [
          {
            type: "text",
            text: `Entry "${entry_uid}" deleted successfully from content type "${content_type_uid}".`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: handleError(error),
          },
        ],
        isError: true,
      };
    }
  }
);

// Get Content Type
server.tool(
  "get_content_type",
  {
    uid: z.string().describe("Content type UID to retrieve"),
    include_global_field_schema: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include global field schemas"),
  },
  async ({ uid, include_global_field_schema }) => {
    try {
      const url = new URL(`${API_BASE_URL}/content_types/${uid}`);

      // Add query parameter if needed
      if (include_global_field_schema) {
        url.searchParams.append("include_global_field_schema", "true");
      }

      const response = await axios.get(url.toString(), {
        headers: getHeaders(),
      });

      return {
        content: [
          {
            type: "text",
            text: `Content type retrieved successfully:\n\n${JSON.stringify(
              response.data.content_type,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving content type: ${handleError(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Get All Content Types
server.tool(
  "get_all_content_types",
  {
    include_global_field_schema: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include global field schemas"),
    include_count: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include total count of content types"),
    skip: z
      .number()
      .optional()
      .default(0)
      .describe("Number of content types to skip (for pagination)"),
    limit: z
      .number()
      .optional()
      .default(100)
      .describe("Number of content types to return (max 100)"),
    include_branch_info: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include branch information in response"),
    include_reference_content_type_uid: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include content type UIDs in references"),
  },
  async ({
    include_global_field_schema,
    include_count,
    skip,
    limit,
    include_branch_info,
    include_reference_content_type_uid,
  }) => {
    try {
      const url = new URL(`${API_BASE_URL}/content_types`);

      // Add query parameters if needed
      if (include_global_field_schema) {
        url.searchParams.append("include_global_field_schema", "true");
      }

      if (include_count) {
        url.searchParams.append("include_count", "true");
      }

      if (skip > 0) {
        url.searchParams.append("skip", skip.toString());
      }

      if (limit !== 100) {
        url.searchParams.append("limit", limit.toString());
      }

      if (include_branch_info) {
        url.searchParams.append("include_branch_info", "true");
      }

      if (include_reference_content_type_uid) {
        url.searchParams.append("include_reference_content_type_uid", "true");
      }

      const response = await axios.get(url.toString(), {
        headers: getHeaders(),
      });

      // Format the response
      let formattedResponse = "";

      if (include_count && response.data.count) {
        formattedResponse += `Total content types: ${response.data.count}\n\n`;
      }

      formattedResponse += `Content types retrieved: ${response.data.content_types.length}\n\n`;

      if (response.data.content_types.length > 0) {
        // For large result sets, show a summary
        if (response.data.content_types.length > 10) {
          formattedResponse += `First 10 content types:\n`;
          for (let i = 0; i < 10; i++) {
            const contentType = response.data.content_types[i];
            formattedResponse += `${i + 1}. ${contentType.uid} - ${contentType.title}\n`;
          }
          formattedResponse += `\n(${
            response.data.content_types.length - 10
          } more content types not shown)\n\n`;
        } else {
          formattedResponse += `Content types:\n`;
          response.data.content_types.forEach((contentType, index) => {
            formattedResponse += `${index + 1}. ${contentType.uid} - ${
              contentType.title
            }\n`;
          });
          formattedResponse += `\n`;
        }

        formattedResponse += `Full response data:\n${JSON.stringify(
          response.data,
          null,
          2
        )}`;
      } else {
        formattedResponse += "No content types found.";
      }

      return {
        content: [
          {
            type: "text",
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving content types: ${handleError(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Get Entry
server.tool(
  "get_entry",
  {
    content_type_uid: z.string().describe("Content type UID"),
    entry_uid: z.string().describe("Entry UID to retrieve"),
    locale: z.string().optional().describe("Locale code (e.g., 'en-us')"),
    include_references: z.array(z.string()).optional().describe("References to include"),
    include_reference_content_type_uid: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include content type UIDs in references"),
  },
  async ({
    content_type_uid,
    entry_uid,
    locale,
    include_references,
    include_reference_content_type_uid,
  }) => {
    try {
      const url = new URL(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries/${entry_uid}`
      );

      // Add query parameters if provided
      if (locale) {
        url.searchParams.append("locale", locale);
      }

      if (include_references && include_references.length > 0) {
        url.searchParams.append("include[]", include_references.join(","));
      }

      if (include_reference_content_type_uid) {
        url.searchParams.append("include_reference_content_type_uid", "true");
      }

      const response = await axios.get(url.toString(), {
        headers: getHeaders(),
      });

      return {
        content: [
          {
            type: "text",
            text: `Entry retrieved successfully:\n\n${JSON.stringify(
              response.data.entry,
              null,
              2
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving entry: ${handleError(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Get Entries
server.tool(
  "get_entries",
  {
    content_type_uid: z.string().describe("Content type UID to fetch entries from"),
    locale: z.string().optional().describe("Locale code (e.g., 'en-us')"),
    query: z.string().optional().describe("Query in JSON format to filter entries"),
    include_count: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include total count of entries"),
    skip: z
      .number()
      .optional()
      .default(0)
      .describe("Number of entries to skip (for pagination)"),
    limit: z
      .number()
      .optional()
      .default(100)
      .describe("Number of entries to return (max 100)"),
    include_reference: z.array(z.string()).optional().describe("References to include"),
    include_reference_content_type_uid: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include content type UIDs in references"),
    include_schema: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include content type schema"),
    include_global_field_schema: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include global field schema"),
    asc: z
      .string()
      .optional()
      .describe("Sort entries in ascending order by the specified field UID"),
    desc: z
      .string()
      .optional()
      .describe("Sort entries in descending order by the specified field UID"),
    only: z
      .array(z.string())
      .optional()
      .describe("Include only specified top-level fields in the response"),
    except: z
      .array(z.string())
      .optional()
      .describe("Exclude specified top-level fields from the response"),
    include_metadata: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include metadata in the response"),
    include_publish_details: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include publish details in the response"),
    include_owner: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include owner information in the response"),
  },
  async ({
    content_type_uid,
    locale,
    query,
    include_count,
    skip,
    limit,
    include_reference,
    include_reference_content_type_uid,
    include_schema,
    include_global_field_schema,
    asc,
    desc,
    only,
    except,
    include_metadata,
    include_publish_details,
    include_owner,
  }) => {
    try {
      const url = new URL(`${API_BASE_URL}/content_types/${content_type_uid}/entries`);

      // Add query parameters if provided
      if (locale) {
        url.searchParams.append("locale", locale);
      }

      if (query) {
        url.searchParams.append("query", query);
      }

      if (include_count) {
        url.searchParams.append("include_count", "true");
      }

      if (skip > 0) {
        url.searchParams.append("skip", skip.toString());
      }

      if (limit !== 100) {
        url.searchParams.append("limit", limit.toString());
      }

      if (include_reference && include_reference.length > 0) {
        url.searchParams.append("include[]", include_reference.join(","));
      }

      if (include_reference_content_type_uid) {
        url.searchParams.append("include_reference_content_type_uid", "true");
      }

      if (include_schema) {
        url.searchParams.append("include_schema", "true");
      }

      if (include_global_field_schema) {
        url.searchParams.append("include_global_field_schema", "true");
      }

      if (asc) {
        url.searchParams.append("asc", asc);
      }

      if (desc) {
        url.searchParams.append("desc", desc);
      }

      if (only && only.length > 0) {
        url.searchParams.append("only[BASE][]", only.join(","));
      }

      if (except && except.length > 0) {
        url.searchParams.append("except[BASE][]", except.join(","));
      }

      if (include_metadata) {
        url.searchParams.append("include_metadata", "true");
      }

      if (include_publish_details) {
        url.searchParams.append("include_publish_details", "true");
      }

      if (include_owner) {
        url.searchParams.append("include_owner", "true");
      }

      const response = await axios.get(url.toString(), {
        headers: getHeaders(),
      });

      // Format the response
      let formattedResponse = "";

      if (include_count && response.data.count) {
        formattedResponse += `Total entries: ${response.data.count}\n\n`;
      }

      formattedResponse += `Entries retrieved: ${response.data.entries.length}\n\n`;

      if (response.data.entries.length > 0) {
        // For large result sets, show a summary instead of all data
        if (response.data.entries.length > 10) {
          formattedResponse += `First 10 entries (showing UIDs):\n`;
          for (let i = 0; i < 10; i++) {
            const entry = response.data.entries[i];
            formattedResponse += `${i + 1}. ${entry.uid} - ${
              entry.title || "[No title]"
            }\n`;
          }
          formattedResponse += `\n(${
            response.data.entries.length - 10
          } more entries not shown)\n\n`;
          formattedResponse += `Full response data:\n${JSON.stringify(
            response.data,
            null,
            2
          )}`;
        } else {
          formattedResponse += `Entries:\n${JSON.stringify(
            response.data.entries,
            null,
            2
          )}`;
        }
      } else {
        formattedResponse += "No entries found matching the criteria.";
      }

      return {
        content: [
          {
            type: "text",
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving entries: ${handleError(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Publish Entry
server.tool(
  "publish_entry",
  {
    content_type_uid: z.string().describe("Content type UID"),
    entry_uid: z.string().describe("Entry UID to publish"),
    environment: z.string().describe("Environment to publish to"),
    locale: z.string().default("en-us").describe("Locale code (defaults to en-us)"),
  },
  async ({ content_type_uid, entry_uid, environment, locale }) => {
    try {
      // First get the entry to find its current version
      const entryResponse = await axios.get(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries/${entry_uid}`,
        {
          headers: getHeaders(),
        }
      );

      const version = entryResponse.data.entry._version;

      // Prepare publish payload
      const payload = {
        entry: {
          environments: [environment],
          locales: [locale],
        },
      };

      // Publish the entry
      const response = await axios.post(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries/${entry_uid}/publish`,
        payload,
        { headers: getHeaders() }
      );

      return {
        content: [
          {
            type: "text",
            text: `Entry "${entry_uid}" published successfully to environment "${environment}" in locale "${locale}".`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: handleError(error),
          },
        ],
        isError: true,
      };
    }
  }
);

// Unpublish Entry
server.tool(
  "unpublish_entry",
  {
    content_type_uid: z.string().describe("Content type UID"),
    entry_uid: z.string().describe("Entry UID to unpublish"),
    environment: z.string().describe("Environment to unpublish from"),
    locale: z.string().default("en-us").describe("Locale code (defaults to en-us)"),
  },
  async ({ content_type_uid, entry_uid, environment, locale }) => {
    try {
      // Prepare unpublish payload
      const payload = {
        entry: {
          environments: [environment],
          locales: [locale],
        },
      };

      // Unpublish the entry
      const response = await axios.post(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries/${entry_uid}/unpublish`,
        payload,
        { headers: getHeaders() }
      );

      return {
        content: [
          {
            type: "text",
            text: `Entry "${entry_uid}" unpublished successfully from environment "${environment}" in locale "${locale}".`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: handleError(error),
          },
        ],
        isError: true,
      };
    }
  }
);

// Create Global Field
server.tool(
  "create_global_field",
  {
    title: z.string().describe("Global field title"),
    uid: z.string().describe("Global field UID (unique identifier)"),
    schema: z
      .array(z.object({}).passthrough())
      .describe(
        "Array of schema fields defining the global field structure. Each field object should include properties like:\n- display_name: Field display name\n- uid: Unique identifier for the field\n- data_type: Type of data (text, number, boolean, file, etc.)\n- field_metadata: Additional metadata for the field\n- multiple: Whether field accepts multiple values\n- mandatory: Whether field is required\n- unique: Whether field values must be unique"
      ),
  },
  async ({ title, uid, schema }) => {
    try {
      // Prepare the global field payload
      const payload = {
        global_field: {
          title,
          uid,
          schema,
        },
      };

      console.log("Sending global field payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`${API_BASE_URL}/global_fields`, payload, {
        headers: getHeaders(),
      });

      console.log("API response:", response.data);

      return {
        content: [
          {
            type: "text",
            text: `Global field "${title}" created successfully with UID "${uid}".`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = handleError(error);
      return {
        content: [
          {
            type: "text",
            text: `Error creating global field: ${errorMessage}\n\nPlease ensure your schema adheres to the Contentstack schema specification. Schema should be an array of field objects. Example field objects:

// Text field example
{
  "display_name": "Name",
  "uid": "name",
  "data_type": "text",
  "multiple": false,
  "mandatory": false,
  "unique": false
}

// Rich text editor example
{
  "data_type": "text",
  "display_name": "Description",
  "uid": "description",
  "field_metadata": {
    "allow_rich_text": true,
    "description": "",
    "multiline": false,
    "rich_text_type": "advanced",
    "options": [],
    "version": 3
  },
  "multiple": false,
  "mandatory": false,
  "unique": false
}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Update Global Field
server.tool(
  "update_global_field",
  {
    uid: z.string().describe("Global field UID to update"),
    title: z.string().optional().describe("New global field title"),
    schema: z
      .array(z.object({}).passthrough())
      .optional()
      .describe(
        "Updated schema fields defining the global field structure. Each field object should include properties like:\n- display_name: Field display name\n- uid: Unique identifier for the field\n- data_type: Type of data (text, number, boolean, file, etc.)\n- field_metadata: Additional metadata for the field\n- multiple: Whether field accepts multiple values\n- mandatory: Whether field is required\n- unique: Whether field values must be unique"
      ),
  },
  async ({ uid, title, schema }) => {
    try {
      // First fetch existing global field
      const fetchResponse = await axios.get(`${API_BASE_URL}/global_fields/${uid}`, {
        headers: getHeaders(),
      });

      const existingGlobalField = fetchResponse.data.global_field;

      // Prepare update payload
      const payload = {
        global_field: {
          ...existingGlobalField,
          title: title || existingGlobalField.title,
        },
      };

      // Update schema if provided
      if (schema) {
        payload.global_field.schema = schema;
      }

      // Update global field
      const response = await axios.put(`${API_BASE_URL}/global_fields/${uid}`, payload, {
        headers: getHeaders(),
      });

      return {
        content: [
          {
            type: "text",
            text: `Global field "${uid}" updated successfully.`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = handleError(error);
      return {
        content: [
          {
            type: "text",
            text: `Error updating global field: ${errorMessage}\n\nPlease ensure your schema adheres to the Contentstack schema specification. Schema should be an array of field objects. Example field objects:

// Text field example
{
  "display_name": "Name",
  "uid": "name",
  "data_type": "text",
  "multiple": false,
  "mandatory": false,
  "unique": false
}

// Rich text editor example
{
  "data_type": "text",
  "display_name": "Description",
  "uid": "description",
  "field_metadata": {
    "allow_rich_text": true,
    "description": "",
    "multiline": false,
    "rich_text_type": "advanced",
    "options": [],
    "version": 3
  },
  "multiple": false,
  "mandatory": false,
  "unique": false
}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Get All Global Fields
server.tool(
  "get_all_global_fields",
  {
    include_count: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include total count of global fields"),
    skip: z
      .number()
      .optional()
      .default(0)
      .describe("Number of global fields to skip (for pagination)"),
    limit: z
      .number()
      .optional()
      .default(100)
      .describe("Number of global fields to return (max 100)"),
    include_branch_info: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include branch information in response"),
  },
  async ({ include_count, skip, limit, include_branch_info }) => {
    try {
      const url = new URL(`${API_BASE_URL}/global_fields`);

      // Add query parameters if needed
      if (include_count) {
        url.searchParams.append("include_count", "true");
      }

      if (skip > 0) {
        url.searchParams.append("skip", skip.toString());
      }

      if (limit !== 100) {
        url.searchParams.append("limit", limit.toString());
      }

      if (include_branch_info) {
        url.searchParams.append("include_branch_info", "true");
      }

      const response = await axios.get(url.toString(), {
        headers: getHeaders(),
      });

      // Format the response
      let formattedResponse = "";

      if (include_count && response.data.count) {
        formattedResponse += `Total global fields: ${response.data.count}\n\n`;
      }

      formattedResponse += `Global fields retrieved: ${response.data.global_fields.length}\n\n`;

      if (response.data.global_fields.length > 0) {
        // For large result sets, show a summary
        if (response.data.global_fields.length > 10) {
          formattedResponse += `First 10 global fields:\n`;
          for (let i = 0; i < 10; i++) {
            const globalField = response.data.global_fields[i];
            formattedResponse += `${i + 1}. ${globalField.uid} - ${globalField.title}\n`;
          }
          formattedResponse += `\n(${
            response.data.global_fields.length - 10
          } more global fields not shown)\n\n`;
        } else {
          formattedResponse += `Global fields:\n`;
          response.data.global_fields.forEach((globalField, index) => {
            formattedResponse += `${index + 1}. ${globalField.uid} - ${
              globalField.title
            }\n`;
          });
          formattedResponse += `\n`;
        }

        formattedResponse += `Full response data:\n${JSON.stringify(
          response.data,
          null,
          2
        )}`;
      } else {
        formattedResponse += "No global fields found.";
      }

      return {
        content: [
          {
            type: "text",
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving global fields: ${handleError(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ==========================================
// PROMPTS
// ==========================================

// Prompt for content creation workflow
server.prompt(
  "create_content_workflow",
  {
    content_type_uid: z
      .string()
      .describe("Content type UID for which you want to create content"),
  },
  async ({ content_type_uid }) => {
    try {
      // Fetch content type details to get structure
      const response = await axios.get(
        `${API_BASE_URL}/content_types/${content_type_uid}`,
        {
          headers: getHeaders(),
        }
      );

      const contentType = response.data.content_type;
      const schema = contentType.schema;

      // Generate prompt message with content type structure
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Let's create new content for the "${
                contentType.title
              }" content type. I'll help you through the workflow to create and publish an entry.

The content type has the following structure:
${JSON.stringify(schema, null, 2)}

Let's go through each field to fill in the necessary information. Start by telling me what this entry will be about, and then I'll help gather the specific field values.`,
            },
          },
        ],
      };
    } catch (error) {
      // If content type not found, provide a general prompt
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Let's create new content for the "${content_type_uid}" content type. What would you like to create?

Please provide details for the main fields of your content, and I'll help structure it properly for creation in Contentstack.`,
            },
          },
        ],
      };
    }
  }
);

// Prompt for content analysis
server.prompt(
  "content_analysis",
  {
    content_type_uid: z.string().describe("Content type UID to analyze"),
  },
  async ({ content_type_uid }) => {
    try {
      // Fetch content type and entries
      const contentTypeResponse = await axios.get(
        `${API_BASE_URL}/content_types/${content_type_uid}`,
        {
          headers: getHeaders(),
        }
      );

      const entriesResponse = await axios.get(
        `${API_BASE_URL}/content_types/${content_type_uid}/entries`,
        {
          headers: getHeaders(),
        }
      );

      const contentType = contentTypeResponse.data.content_type;
      const entries = entriesResponse.data.entries;

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Let's analyze the content in the "${contentType.title}" content type:

1. This content type has ${entries.length} entries.
2. The structure of this content type includes these fields: ${Object.keys(
                contentType.schema
              ).join(", ")}

Please help me understand patterns and insights from this content. What would you like to know about this content collection?`,
            },
          },
        ],
      };
    } catch (error) {
      // Fallback prompt
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Let's analyze content in your Contentstack CMS. What specific content type or content collection would you like insights about?`,
            },
          },
        ],
      };
    }
  }
);

// Prompt for content migration planning
server.prompt("migration_planning", {}, () => {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Let's plan a content migration for your Contentstack CMS. I'll help you think through the steps needed for a successful migration.

Please consider these aspects:

1. What is the source of the content you're migrating from?
2. What content types will you need in Contentstack?
3. How does your current content structure map to Contentstack's model?
4. Do you need to transform or enrich content during migration?
5. What's your timeline and are there any specific requirements?

Let's start planning your migration strategy.`,
        },
      },
    ],
  };
});

// ==========================================
// START SERVER
// ==========================================

async function main() {
  if (!API_KEY || !MANAGEMENT_TOKEN) {
    console.error(
      "Error: Missing required environment variables. Please set CONTENTSTACK_API_KEY and CONTENTSTACK_MANAGEMENT_TOKEN."
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Contentstack MCP Server running...");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
