import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { ConfigManager, configManager } from '../../src/config/settings.js'
import { SERVER_VERSION } from '../../src/constants.js'

// Mock dotenv to prevent loading actual .env file
vi.mock('dotenv', () => ({
  config: vi.fn(() => ({ parsed: {} })),
}))

describe('ConfigManager', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    // Clear ALL cucumber studio and MCP environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('CUCUMBERSTUDIO_') || key.startsWith('MCP_') || key.startsWith('LOG_')) {
        delete process.env[key]
      }
    })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('loadFromEnvironment', () => {
    it('should load valid configuration from environment variables', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      const manager = new ConfigManager()
      const config = manager.loadFromEnvironment()

      expect(config).toEqual({
        cucumberStudio: {
          baseUrl: 'https://studio.cucumberstudio.com/api',
          accessToken: 'test-token',
          clientId: 'test-client-id',
          uid: 'test-uid',
        },
        server: {
          name: 'cucumberstudio-mcp',
          version: SERVER_VERSION,
          transport: 'stdio', // Default value
          port: 3000,
          host: '0.0.0.0',
        },
        logging: {
          level: 'info', // Default value
          logApiResponses: false, // Default value
          logRequestBodies: false,
          logResponseBodies: false, // Default value
          transport: 'stderr',
          filePath: undefined,
        },
      })
    })

    it('should use custom base URL when provided', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'
      process.env.CUCUMBERSTUDIO_BASE_URL = 'https://custom-api.example.com'

      const manager = new ConfigManager()
      const config = manager.loadFromEnvironment()

      expect(config.cucumberStudio.baseUrl).toBe('https://custom-api.example.com')
    })

    it('should use custom server configuration when provided', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'
      process.env.MCP_SERVER_NAME = 'custom-server'
      process.env.MCP_SERVER_VERSION = '2.0.0'
      process.env.MCP_TRANSPORT = 'http'
      process.env.MCP_PORT = '8080'
      process.env.MCP_HOST = '0.0.0.0'

      const manager = new ConfigManager()
      const config = manager.loadFromEnvironment()

      expect(config.server).toEqual({
        name: 'custom-server',
        version: '2.0.0',
        transport: 'http',
        port: 8080,
        host: '0.0.0.0',
      })
    })

    it('should throw error when access token is missing', () => {
      // Only set other required fields, leave access token missing
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      const manager = new ConfigManager()

      expect(() => manager.loadFromEnvironment()).toThrow(
        /Configuration validation failed.*CUCUMBERSTUDIO_ACCESS_TOKEN/,
      )
    })

    it('should throw error when client ID is missing', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      const manager = new ConfigManager()

      expect(() => manager.loadFromEnvironment()).toThrow(/Configuration validation failed.*CUCUMBERSTUDIO_CLIENT_ID/)
    })

    it('should throw error when UID is missing', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'

      const manager = new ConfigManager()

      expect(() => manager.loadFromEnvironment()).toThrow(/Configuration validation failed.*CUCUMBERSTUDIO_UID/)
    })

    it('should throw error when base URL is invalid', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'
      process.env.CUCUMBERSTUDIO_BASE_URL = 'invalid-url'

      const manager = new ConfigManager()

      expect(() => manager.loadFromEnvironment()).toThrow()
    })

    it('should throw error when transport is invalid', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'
      process.env.MCP_TRANSPORT = 'invalid-transport'

      const manager = new ConfigManager()

      expect(() => manager.loadFromEnvironment()).toThrow()
    })

    it('should throw error when port is invalid', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'
      process.env.MCP_PORT = 'invalid-port'

      const manager = new ConfigManager()

      expect(() => manager.loadFromEnvironment()).toThrow()
    })
  })

  describe('getConfig', () => {
    it('should return config after loading', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      const manager = new ConfigManager()
      const config1 = manager.loadFromEnvironment()
      const config2 = manager.getConfig()

      expect(config2).toEqual(config1)
    })

    it('should throw error when config not loaded', () => {
      const manager = new ConfigManager()

      expect(() => manager.getConfig()).toThrow('Configuration not loaded. Call loadFromEnvironment() first.')
    })
  })

  describe('validate', () => {
    it('should return true when config is valid', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client-id'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      const manager = new ConfigManager()
      manager.loadFromEnvironment()

      expect(manager.validate()).toBe(true)
    })

    it('should return false when config not loaded', () => {
      const manager = new ConfigManager()

      expect(manager.validate()).toBe(false)
    })
  })

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(configManager).toBeInstanceOf(ConfigManager)
    })
  })
})
