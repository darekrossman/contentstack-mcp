// Contentstack MCP Server Types

// API Error types
export interface ContentstackErrorResponse {
  error_code?: number | string
  error_message?: string
  errors?: Record<string, unknown>
  [key: string]: unknown
}

export interface ApiError extends Error {
  response?: {
    status: number
    data: ContentstackErrorResponse
  }
  request?: unknown
}

// Content Type related types
export interface ContentTypeSchema {
  display_name: string
  uid: string
  data_type: string
  field_metadata?: Record<string, unknown>
  multiple?: boolean
  mandatory?: boolean
  unique?: boolean
  [key: string]: unknown
}

export interface ContentTypeOptions {
  is_page?: boolean
  singleton?: boolean
  title?: string
  sub_title?: string[]
  url_pattern?: string
  url_prefix?: string
  [key: string]: unknown
}

export interface ContentTypeFieldRule {
  conditions: Array<{
    operand_field: string
    operator: string
    value?: unknown
  }>
  actions: Array<{
    action: string
    target_field: string
  }>
  match_type: string
}

export interface ContentTypeTaxonomy {
  taxonomy_uid: string
  max_terms?: number
  mandatory?: boolean
  non_localizable?: boolean
}

export interface ContentType {
  title: string
  uid: string
  schema: ContentTypeSchema[]
  options?: ContentTypeOptions
  field_rules?: ContentTypeFieldRule[]
  taxonomies?: ContentTypeTaxonomy[]
  [key: string]: unknown
}

export interface ContentTypePayload {
  content_type: ContentType
}

// Entry related types
export interface Entry {
  uid: string
  title?: string
  [key: string]: unknown
}

export interface EntryPayload {
  entry: Record<string, unknown>
}

export interface PublishUnpublishPayload {
  entry: {
    environments: string[]
    locales: string[]
  }
}

// Global Field related types
export interface GlobalField {
  title: string
  uid: string
  schema: ContentTypeSchema[]
  [key: string]: unknown
}

export interface GlobalFieldPayload {
  global_field: GlobalField
}

// API Response types
export interface ContentTypeResponse {
  content_type: ContentType
}

export interface ContentTypesResponse {
  content_types: ContentType[]
  count?: number
}

export interface EntryResponse {
  entry: Entry
}

export interface EntriesResponse {
  entries: Entry[]
  count?: number
}

export interface GlobalFieldResponse {
  global_field: GlobalField
}

export interface GlobalFieldsResponse {
  global_fields: GlobalField[]
  count?: number
}

export interface AssetsResponse {
  assets: Array<Record<string, unknown>>
  count?: number
}
