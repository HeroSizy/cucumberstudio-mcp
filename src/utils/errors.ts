import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js'

/**
 * Convert various error types into MCP-compatible errors
 * Enhanced for DXT extension compatibility with detailed error context
 */
export function createMcpError(error: unknown, context?: string): McpError {
  if (error instanceof McpError) {
    return error
  }

  if (error instanceof Error) {
    // Handle API-specific errors
    if (error.name === 'CucumberStudioApiError') {
      return new McpError(
        ErrorCode.InternalError,
        `Cucumber Studio API error${context ? ` (${context})` : ''}: ${error.message}`,
      )
    }

    // Handle validation errors (including configuration)
    if (error.name === 'ZodError') {
      return new McpError(
        ErrorCode.InvalidParams,
        `Validation error${context ? ` (${context})` : ''}: ${error.message}`,
      )
    }

    // Handle configuration errors specifically for DXT
    if (error.message.includes('Configuration validation failed')) {
      return new McpError(
        ErrorCode.InvalidRequest,
        `Configuration error: ${error.message}. Please check your DXT extension settings.`,
      )
    }

    // Handle network/timeout errors
    if (error.name === 'AxiosError' || error.message.includes('timeout')) {
      return new McpError(
        ErrorCode.InternalError,
        `Network error${context ? ` (${context})` : ''}: ${error.message}. Please check your connection and API credentials.`,
      )
    }

    // Handle general errors
    return new McpError(ErrorCode.InternalError, `${context ? `${context}: ` : ''}${error.message}`)
  }

  // Handle unknown errors
  return new McpError(ErrorCode.InternalError, `Unknown error${context ? ` (${context})` : ''}: ${String(error)}`)
}

/**
 * Safely execute async operations with error handling
 */
export async function safeExecute<T>(operation: () => Promise<T>, context?: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw createMcpError(error, context)
  }
}
