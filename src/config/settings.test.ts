import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigManager, configManager } from './settings.js';

describe('ConfigManager', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // Clear environment
    delete process.env.CUCUMBER_STUDIO_ACCESS_TOKEN;
    delete process.env.CUCUMBER_STUDIO_CLIENT_ID;
    delete process.env.CUCUMBER_STUDIO_UID;
    delete process.env.CUCUMBER_STUDIO_BASE_URL;
    delete process.env.MCP_SERVER_NAME;
    delete process.env.MCP_SERVER_VERSION;
    delete process.env.MCP_TRANSPORT;
    delete process.env.MCP_PORT;
    delete process.env.MCP_HOST;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadFromEnvironment', () => {
    it('should load valid configuration from environment variables', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';

      const manager = new ConfigManager();
      const config = manager.loadFromEnvironment();

      expect(config).toEqual({
        cucumberStudio: {
          baseUrl: 'https://studio-api.cucumberstudio.com',
          accessToken: 'test-token',
          clientId: 'test-client-id',
          uid: 'test-uid',
        },
        server: {
          name: 'cucumberstudio-mcp',
          version: '1.0.0',
          transport: 'stdio',
          port: 3000,
          host: '127.0.0.1',
        },
      });
    });

    it('should use custom base URL when provided', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';
      process.env.CUCUMBER_STUDIO_BASE_URL = 'https://custom-api.example.com';

      const manager = new ConfigManager();
      const config = manager.loadFromEnvironment();

      expect(config.cucumberStudio.baseUrl).toBe('https://custom-api.example.com');
    });

    it('should use custom server configuration when provided', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';
      process.env.MCP_SERVER_NAME = 'custom-server';
      process.env.MCP_SERVER_VERSION = '2.0.0';
      process.env.MCP_TRANSPORT = 'http';
      process.env.MCP_PORT = '8080';
      process.env.MCP_HOST = '0.0.0.0';

      const manager = new ConfigManager();
      const config = manager.loadFromEnvironment();

      expect(config.server).toEqual({
        name: 'custom-server',
        version: '2.0.0',
        transport: 'http',
        port: 8080,
        host: '0.0.0.0',
      });
    });

    it('should throw error when access token is missing', () => {
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';

      const manager = new ConfigManager();
      
      expect(() => manager.loadFromEnvironment()).toThrow(
        /Configuration validation failed.*CUCUMBER_STUDIO_ACCESS_TOKEN/
      );
    });

    it('should throw error when client ID is missing', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';

      const manager = new ConfigManager();
      
      expect(() => manager.loadFromEnvironment()).toThrow(
        /Configuration validation failed.*CUCUMBER_STUDIO_CLIENT_ID/
      );
    });

    it('should throw error when UID is missing', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';

      const manager = new ConfigManager();
      
      expect(() => manager.loadFromEnvironment()).toThrow(
        /Configuration validation failed.*CUCUMBER_STUDIO_UID/
      );
    });

    it('should throw error when base URL is invalid', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';
      process.env.CUCUMBER_STUDIO_BASE_URL = 'invalid-url';

      const manager = new ConfigManager();
      
      expect(() => manager.loadFromEnvironment()).toThrow();
    });

    it('should throw error when transport is invalid', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';
      process.env.MCP_TRANSPORT = 'invalid-transport';

      const manager = new ConfigManager();
      
      expect(() => manager.loadFromEnvironment()).toThrow();
    });

    it('should throw error when port is invalid', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';
      process.env.MCP_PORT = 'invalid-port';

      const manager = new ConfigManager();
      
      expect(() => manager.loadFromEnvironment()).toThrow();
    });
  });

  describe('getConfig', () => {
    it('should return config after loading', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';

      const manager = new ConfigManager();
      const config1 = manager.loadFromEnvironment();
      const config2 = manager.getConfig();

      expect(config2).toEqual(config1);
    });

    it('should throw error when config not loaded', () => {
      const manager = new ConfigManager();
      
      expect(() => manager.getConfig()).toThrow(
        'Configuration not loaded. Call loadFromEnvironment() first.'
      );
    });
  });

  describe('validate', () => {
    it('should return true when config is valid', () => {
      process.env.CUCUMBER_STUDIO_ACCESS_TOKEN = 'test-token';
      process.env.CUCUMBER_STUDIO_CLIENT_ID = 'test-client-id';
      process.env.CUCUMBER_STUDIO_UID = 'test-uid';

      const manager = new ConfigManager();
      manager.loadFromEnvironment();

      expect(manager.validate()).toBe(true);
    });

    it('should return false when config not loaded', () => {
      const manager = new ConfigManager();

      expect(manager.validate()).toBe(false);
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(configManager).toBeInstanceOf(ConfigManager);
    });
  });
});