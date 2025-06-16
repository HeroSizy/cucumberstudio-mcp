import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CucumberStudioMcpServer } from './server.js';

// Mock all dependencies
vi.mock('@modelcontextprotocol/sdk/server/index.js');
vi.mock('./config/settings.js');
vi.mock('./api/client.js');
vi.mock('./utils/validation.js');
vi.mock('./transports/index.js');
vi.mock('./tools/projects.js');
vi.mock('./tools/scenarios.js');
vi.mock('./tools/action-words.js');
vi.mock('./tools/test-runs.js');

describe('CucumberStudioMcpServer', () => {
  let mockServer: any;
  let mockApiClient: any;
  let mockProjectTools: any;
  let mockScenarioTools: any;
  let mockActionWordTools: any;
  let mockTestRunTools: any;
  let mockStdioTransport: any;

  beforeEach(() => {
    // Mock Server
    mockServer = {
      setRequestHandler: vi.fn(),
      connect: vi.fn(),
    };
    vi.mocked(Server).mockImplementation(() => mockServer);

    // Mock API Client
    mockApiClient = {
      testConnection: vi.fn().mockResolvedValue(true),
    };

    // Mock tool classes
    mockProjectTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'project_tool' }]),
      handleToolCall: vi.fn(),
    };
    mockScenarioTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'scenario_tool' }]),
      handleToolCall: vi.fn(),
    };
    mockActionWordTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'action_word_tool' }]),
      handleToolCall: vi.fn(),
    };
    mockTestRunTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'test_run_tool' }]),
      handleToolCall: vi.fn(),
    };

    // Mock transport
    mockStdioTransport = {
      start: vi.fn(),
    };

    // Mock modules
    const mockConfig = {
      cucumberStudio: {
        baseUrl: 'https://api.example.com',
        accessToken: 'token',
        clientId: 'client',
        uid: 'uid',
      },
      server: {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio' as const,
        port: 3000,
        host: '127.0.0.1',
      },
    };

    vi.doMock('./config/settings.js', () => ({
      configManager: {
        loadFromEnvironment: vi.fn().mockReturnValue(mockConfig),
      },
    }));

    vi.doMock('./api/client.js', () => ({
      CucumberStudioApiClient: vi.fn().mockImplementation(() => mockApiClient),
    }));

    vi.doMock('./utils/validation.js', () => ({
      validateEnvironment: vi.fn(),
    }));

    vi.doMock('./transports/index.js', () => ({
      StdioTransport: vi.fn().mockImplementation(() => mockStdioTransport),
    }));

    vi.doMock('./tools/projects.js', () => ({
      ProjectTools: vi.fn().mockImplementation(() => mockProjectTools),
    }));

    vi.doMock('./tools/scenarios.js', () => ({
      ScenarioTools: vi.fn().mockImplementation(() => mockScenarioTools),
    }));

    vi.doMock('./tools/action-words.js', () => ({
      ActionWordTools: vi.fn().mockImplementation(() => mockActionWordTools),
    }));

    vi.doMock('./tools/test-runs.js', () => ({
      TestRunTools: vi.fn().mockImplementation(() => mockTestRunTools),
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create MCP server with correct configuration', () => {
      new CucumberStudioMcpServer();

      expect(Server).toHaveBeenCalledWith(
        {
          name: 'cucumberstudio-mcp',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );
    });

    it('should set up tool handlers', () => {
      new CucumberStudioMcpServer();

      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('createServer', () => {
    it('should create and return a new server instance', () => {
      const server = CucumberStudioMcpServer.createServer();

      expect(server).toBeDefined();
      expect(Server).toHaveBeenCalled();
    });
  });

  describe('initialize', () => {
    it('should initialize all components successfully', async () => {
      const server = new CucumberStudioMcpServer();
      
      await server.initialize();

      expect(mockApiClient.testConnection).toHaveBeenCalled();
    });

    it('should throw error when API connection fails', async () => {
      mockApiClient.testConnection.mockResolvedValue(false);
      
      const server = new CucumberStudioMcpServer();

      await expect(server.initialize()).rejects.toThrow(
        'Failed to connect to Cucumber Studio API. Please check your credentials.'
      );
    });
  });

  describe('runWithTransport', () => {
    it('should start stdio transport', async () => {
      const server = new CucumberStudioMcpServer();
      await server.initialize();

      await server.runWithTransport('stdio');

      expect(mockStdioTransport.start).toHaveBeenCalled();
    });

    it('should throw error for unsupported transport in instance mode', async () => {
      const server = new CucumberStudioMcpServer();
      await server.initialize();

      await expect(server.runWithTransport('http' as any)).rejects.toThrow(
        'Transport http not supported in instance mode'
      );
    });
  });

  describe('getServer', () => {
    it('should return the server instance', () => {
      const server = new CucumberStudioMcpServer();
      const mcpServer = server.getServer();

      expect(mcpServer).toBe(mockServer);
    });
  });
});