import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

import { MAX_PAGE_SIZE } from '../constants.js'

// Common validation schemas
export const ProjectIdSchema = z.string().min(1, 'Project ID is required')
export const ScenarioIdSchema = z.string().min(1, 'Scenario ID is required')
export const ActionWordIdSchema = z.string().min(1, 'Action Word ID is required')
export const FolderIdSchema = z.string().min(1, 'Folder ID is required')
export const TestRunIdSchema = z.string().min(1, 'Test Run ID is required')
export const BuildIdSchema = z.string().min(1, 'Build ID is required')

// Pagination schema
export const PaginationSchema = z
  .object({
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
  })
  .optional()

// Filter schema
export const FilterSchema = z
  .object({
    name: z.string().optional(),
    tags: z.string().optional(),
  })
  .optional()

// List parameters schema
export const ListParamsSchema = z
  .object({
    pagination: PaginationSchema,
    filter: FilterSchema,
  })
  .optional()

/**
 * Convert pagination and filter parameters to API format
 */
export function convertToApiParams(params?: {
  pagination?: { page?: number; pageSize?: number }
  filter?: { name?: string; tags?: string }
}): Record<string, unknown> {
  if (!params) return {}

  const apiParams: Record<string, unknown> = {}

  if (params.pagination?.page) {
    apiParams['page[number]'] = params.pagination.page
  }

  if (params.pagination?.pageSize) {
    apiParams['page[size]'] = params.pagination.pageSize
  }

  if (params.filter?.name) {
    apiParams['filter[name]'] = params.filter.name
  }

  if (params.filter?.tags) {
    apiParams['filter[tags]'] = params.filter.tags
  }

  return apiParams
}

/**
 * Validate input against a schema and throw MCP error if invalid
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown, context?: string): T {
  try {
    return schema.parse(input)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      throw new McpError(ErrorCode.InvalidParams, `Invalid parameters${context ? ` for ${context}` : ''}: ${issues}`)
    }
    throw error
  }
}

/**
 * Validate that required environment variables are present
 */
export function validateEnvironment(): void {
  const required = ['CUCUMBERSTUDIO_ACCESS_TOKEN', 'CUCUMBERSTUDIO_CLIENT_ID', 'CUCUMBERSTUDIO_UID']

  const missing = required.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    throw new McpError(ErrorCode.InvalidRequest, `Missing required environment variables: ${missing.join(', ')}`)
  }
}
