import { z } from 'zod'
import { config as loadDotenv } from 'dotenv'

// Configuration schema for type safety and validation
const ConfigSchema = z.object({
  cucumberStudio: z.object({
    baseUrl: z.string().url().default('https://studio.cucumberstudio.com/api'),
    accessToken: z.string().min(1),
    clientId: z.string().min(1),
    uid: z.string().min(1),
  }),
  server: z.object({
    name: z.string().default('cucumberstudio-mcp'),
    version: z.string().default('1.0.0'),
    transport: z.enum(['stdio', 'http', 'streamable-http']).default('stdio'),
    port: z.number().int().min(1).max(65535).default(3000),
    host: z.string().default('0.0.0.0'),
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
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
        baseUrl: process.env.CUCUMBER_STUDIO_BASE_URL,
        accessToken: process.env.CUCUMBER_STUDIO_ACCESS_TOKEN,
        clientId: process.env.CUCUMBER_STUDIO_CLIENT_ID,
        uid: process.env.CUCUMBER_STUDIO_UID,
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
            'CUCUMBER_STUDIO_ACCESS_TOKEN, CUCUMBER_STUDIO_CLIENT_ID, CUCUMBER_STUDIO_UID',
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
