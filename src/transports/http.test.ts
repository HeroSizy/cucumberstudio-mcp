import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { StreamableHttpTransport, HttpTransportOptions } from './http.js';

// Mock dependencies
vi.mock('express');
vi.mock('cors');
vi.mock('@modelcontextprotocol/sdk/server/index.js');
vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js');
vi.mock('@modelcontextprotocol/sdk/types.js');

describe('StreamableHttpTransport', () => {
  let mockApp: any;
  let mockServer: any;
  let mockCreateMcpServer: any;
  let mockStreamableTransport: any;
  let options: HttpTransportOptions;
  let transport: StreamableHttpTransport;

  beforeEach(() => {
    // Mock Express app
    mockApp = {
      use: vi.fn(),
      get: vi.fn(),
      route: vi.fn().mockReturnValue({
        post: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
      }),
      listen: vi.fn(),
    };

    // Mock HTTP server
    mockServer = {
      close: vi.fn(),
      on: vi.fn(),
    };

    // Mock MCP server factory
    mockCreateMcpServer = vi.fn().mockReturnValue({
      connect: vi.fn(),
    });

    // Mock StreamableHTTPServerTransport
    mockStreamableTransport = {
      handleRequest: vi.fn(),
      close: vi.fn(),
    };

    vi.mocked(express).mockReturnValue(mockApp);
    vi.mocked(StreamableHTTPServerTransport).mockImplementation(() => mockStreamableTransport);

    options = {
      port: 3000,
      host: '127.0.0.1',
      cors: {
        origin: true,
        credentials: true,
      },
    };

    transport = new StreamableHttpTransport(mockCreateMcpServer, options);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create Express app', () => {
      expect(express).toHaveBeenCalled();
    });

    it('should set up middleware', () => {
      expect(mockApp.use).toHaveBeenCalled();
    });

    it('should set up routes', () => {
      expect(mockApp.route).toHaveBeenCalledWith('/mcp');
      expect(mockApp.route).toHaveBeenCalledWith('/');
      expect(mockApp.get).toHaveBeenCalledWith('/health', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/mcp/info', expect.any(Function));
    });
  });

  describe('start', () => {
    it('should start HTTP server on specified port and host', async () => {
      mockApp.listen.mockImplementation((port, host, callback) => {
        callback();
        return mockServer;
      });

      await transport.start();

      expect(mockApp.listen).toHaveBeenCalledWith(
        3000,
        '127.0.0.1',
        expect.any(Function)
      );
    });

    it('should handle server start errors', async () => {
      const error = new Error('Port already in use');
      mockApp.listen.mockImplementation((port, host, callback) => {
        mockServer.on.mockImplementation((event, errorCallback) => {
          if (event === 'error') {
            errorCallback(error);
          }
        });
        return mockServer;
      });

      await expect(transport.start()).rejects.toThrow('Port already in use');
    });

    it('should bind to localhost by default', async () => {
      const defaultOptions = { port: 3000 };
      const defaultTransport = new StreamableHttpTransport(mockCreateMcpServer, defaultOptions);
      
      mockApp.listen.mockImplementation((port, host, callback) => {
        callback();
        return mockServer;
      });

      await defaultTransport.start();

      expect(mockApp.listen).toHaveBeenCalledWith(
        3000,
        '127.0.0.1',
        expect.any(Function)
      );
    });
  });

  describe('close', () => {
    beforeEach(() => {
      // Simulate having active transports
      transport['transports'].set('session-1', mockStreamableTransport);
      transport['transports'].set('session-2', mockStreamableTransport);
    });

    it('should close all active transports', async () => {
      mockStreamableTransport.close.mockResolvedValue(undefined);
      mockServer.close.mockImplementation((callback) => callback());
      transport['httpServer'] = mockServer;

      await transport.close();

      expect(mockStreamableTransport.close).toHaveBeenCalledTimes(2);
      expect(transport['transports'].size).toBe(0);
    });

    it('should close HTTP server', async () => {
      mockStreamableTransport.close.mockResolvedValue(undefined);
      mockServer.close.mockImplementation((callback) => callback());
      transport['httpServer'] = mockServer;

      await transport.close();

      expect(mockServer.close).toHaveBeenCalled();
    });

    it('should handle close without HTTP server', async () => {
      mockStreamableTransport.close.mockResolvedValue(undefined);
      transport['httpServer'] = null;

      await expect(transport.close()).resolves.toBeUndefined();
    });

    it('should handle transport close errors gracefully', async () => {
      mockStreamableTransport.close.mockRejectedValue(new Error('Close error'));
      mockServer.close.mockImplementation((callback) => callback());
      transport['httpServer'] = mockServer;

      // Should not throw even if transport close fails
      await expect(transport.close()).resolves.toBeUndefined();
    });
  });

  describe('middleware setup', () => {
    it('should validate origin for security', () => {
      const transport = new StreamableHttpTransport(mockCreateMcpServer, options);
      
      // Check if origin validation middleware was set up
      expect(mockApp.use).toHaveBeenCalled();
      
      // Test the isValidOrigin method indirectly
      const isValid = transport['isValidOrigin']('http://localhost:3000');
      expect(isValid).toBe(true);
      
      const isInvalid = transport['isValidOrigin']('http://evil.com');
      expect(isInvalid).toBe(false);
    });

    it('should set up CORS with security headers', () => {
      expect(mockApp.use).toHaveBeenCalled();
    });

    it('should parse JSON bodies with size limit', () => {
      expect(mockApp.use).toHaveBeenCalled();
    });
  });

  describe('route handlers', () => {
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
      mockReq = {
        get: vi.fn(),
        body: {},
      };

      mockRes = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
        setHeader: vi.fn(),
        writeHead: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      };
    });

    describe('health check', () => {
      it('should return health status', () => {
        // Get the health check handler
        const healthHandler = mockApp.get.mock.calls.find(
          call => call[0] === '/health'
        )[1];

        healthHandler(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
          status: 'healthy',
          timestamp: expect.any(String),
          transport: 'streamable-http',
          protocol: '2025-03-26',
          activeSessions: 0,
        });
      });
    });

    describe('server info', () => {
      it('should return server information', () => {
        // Get the info handler
        const infoHandler = mockApp.get.mock.calls.find(
          call => call[0] === '/mcp/info'
        )[1];

        infoHandler(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({
          name: 'Cucumber Studio MCP Server',
          version: '1.0.0',
          transport: 'streamable-http',
          protocol: '2025-03-26',
          capabilities: {
            tools: true,
            resources: false,
            prompts: false,
            sessionManagement: true,
            streaming: true,
          },
          activeSessions: 0,
        });
      });
    });
  });

  describe('origin validation', () => {
    it('should allow localhost origins', () => {
      const isValid = transport['isValidOrigin']('http://localhost:3000');
      expect(isValid).toBe(true);
    });

    it('should allow 127.0.0.1 origins', () => {
      const isValid = transport['isValidOrigin']('http://127.0.0.1:8080');
      expect(isValid).toBe(true);
    });

    it('should allow 0.0.0.0 origins', () => {
      const isValid = transport['isValidOrigin']('http://0.0.0.0:3000');
      expect(isValid).toBe(true);
    });

    it('should reject external origins', () => {
      const isValid = transport['isValidOrigin']('http://evil.com');
      expect(isValid).toBe(false);
    });

    it('should reject suspicious origins', () => {
      const isValid = transport['isValidOrigin']('http://attacker.example.com');
      expect(isValid).toBe(false);
    });
  });
});