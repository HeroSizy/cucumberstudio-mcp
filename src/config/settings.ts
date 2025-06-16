import { z } from 'zod'

// Configuration schema for type safety and validation
const ConfigSchema = z.object({
  cucumberStudio: z.object({
    baseUrl: z.string().url().default('https://studio-api.cucumberstudio.com'),
    accessToken: z.string().min(1),
    clientId: z.string().min(1),
    uid: z.string().min(1),
  }),
  server: z.object({
    name: z.string().default('cucumberstudio-mcp'),
    version: z.string().default('1.0.0'),
    transport: z.enum(['stdio', 'http', 'streamable-http']).default('stdio'),
    port: z.number().int().min(1).max(65535).default(3000),
    host: z.string().default('127.0.0.1'),
  }),
})

export type Config = z.infer<typeof ConfigSchema>

export class ConfigManager {
  private config: Config | null = null

  /**
   * Load configuration from environment variables
   */
  public loadFromEnvironment(): Config {
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
