import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

import {
  SERVER_NAME,
  SERVER_VERSION,
  DEFAULT_API_BASE_URL,
  DEFAULT_PORT,
  DEFAULT_HOST,
  DEFAULT_LOG_LEVEL,
} from '../constants.js'

// Configuration schema for type safety and validation
const ConfigSchema = z.object({
  cucumberStudio: z.object({
    baseUrl: z.string().url().default(DEFAULT_API_BASE_URL),
    accessToken: z.string().min(1),
    clientId: z.string().min(1),
    uid: z.string().min(1),
  }),
  server: z.object({
    name: z.string().default(SERVER_NAME),
    version: z.string().default(SERVER_VERSION),
    transport: z.enum(['stdio', 'http', 'streamable-http']).default('stdio'),
    port: z.number().int().min(1).max(65535).default(DEFAULT_PORT),
    host: z.string().default(DEFAULT_HOST),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default(DEFAULT_LOG_LEVEL as 'info'),
    logApiResponses: z.boolean().default(false),
    logRequestBodies: z.boolean().default(false),
    logResponseBodies: z.boolean().default(false),
    transport: z.enum(['console', 'file', 'stderr', 'none']).default('stderr'),
    filePath: z.string().optional(),
  }),
})

export type Config = z.infer<typeof ConfigSchema>

export class ConfigManager {
  private config: Config | null = null

  /**
   * Load configuration from environment variables
   */
  public loadFromEnvironment(): Config {
    // Auto-load .env file if it exists
    loadDotenv({ path: '.env' })
    const rawConfig = {
      cucumberStudio: {
        baseUrl: process.env.CUCUMBERSTUDIO_BASE_URL,
        accessToken: process.env.CUCUMBERSTUDIO_ACCESS_TOKEN,
        clientId: process.env.CUCUMBERSTUDIO_CLIENT_ID,
        uid: process.env.CUCUMBERSTUDIO_UID,
      },
      server: {
        name: process.env.MCP_SERVER_NAME,
        version: process.env.MCP_SERVER_VERSION,
        transport: process.env.MCP_TRANSPORT,
        port: process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : undefined,
        host: process.env.MCP_HOST,
      },
      logging: {
        level: process.env.LOG_LEVEL,
        logApiResponses: process.env.LOG_API_RESPONSES === 'true',
        logRequestBodies: process.env.LOG_REQUEST_BODIES === 'true',
        logResponseBodies: process.env.LOG_RESPONSE_BODIES === 'true',
        transport: process.env.LOG_TRANSPORT,
        filePath: process.env.LOG_FILE,
      },
    }

    try {
      this.config = ConfigSchema.parse(rawConfig)
      return this.config
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingFields = error.errors.map((e) => e.path.join('.')).join(', ')
        throw new Error(
          `Configuration validation failed. Missing or invalid fields: ${missingFields}. ` +
            'Please ensure all required environment variables are set: ' +
            'CUCUMBERSTUDIO_ACCESS_TOKEN, CUCUMBERSTUDIO_CLIENT_ID, CUCUMBERSTUDIO_UID',
        )
      }
      throw error
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): Config {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadFromEnvironment() first.')
    }
    return this.config
  }

  /**
   * Validate that all required configuration is present
   */
  public validate(): boolean {
    try {
      this.getConfig()
      return true
    } catch {
      return false
    }
  }
}

// Singleton instance
export const configManager = new ConfigManager()
