import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock all dependencies with factory functions
vi.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: vi.fn(),
}))

vi.mock('@/config/settings.js', () => ({
  configManager: {
    loadFromEnvironment: vi.fn(),
  },
}))

vi.mock('@/api/client.js', () => ({
  CucumberStudioApiClient: vi.fn(),
}))

vi.mock('@/utils/validation.js', () => ({
  validateEnvironment: vi.fn(),
}))

vi.mock('@/transports/index.js', () => ({
  StdioTransport: vi.fn(),
}))

vi.mock('@/tools/projects.js', () => ({
  ProjectTools: vi.fn(),
}))

vi.mock('@/tools/scenarios.js', () => ({
  ScenarioTools: vi.fn(),
}))

vi.mock('@/tools/action-words.js', () => ({
  ActionWordTools: vi.fn(),
}))

vi.mock('@/tools/test-runs.js', () => ({
  TestRunTools: vi.fn(),
}))

// Import after mocks are set up
import { CucumberStudioApiClient } from '@/api/client.js'
import { configManager } from '@/config/settings.js'
import { CucumberStudioMcpServer } from '@/server.js'
import { ActionWordTools } from '@/tools/action-words.js'
import { ProjectTools } from '@/tools/projects.js'
import { ScenarioTools } from '@/tools/scenarios.js'
import { TestRunTools } from '@/tools/test-runs.js'
import { StdioTransport } from '@/transports/index.js'
import { validateEnvironment } from '@/utils/validation.js'

describe('CucumberStudioMcpServer', () => {
  let mockServer: any
  let mockApiClient: any
  let mockProjectTools: any
  let mockScenarioTools: any
  let mockActionWordTools: any
  let mockTestRunTools: any
  let mockStdioTransport: any

  beforeEach(() => {
    // Mock Server
    mockServer = {
      setRequestHandler: vi.fn(),
      connect: vi.fn(),
    }
    vi.mocked(Server).mockImplementation(() => mockServer)

    // Mock API Client
    mockApiClient = {
      testConnection: vi.fn().mockResolvedValue(true),
    }

    // Mock tool classes
    mockProjectTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'project_tool' }]),
      handleToolCall: vi.fn(),
    }
    mockScenarioTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'scenario_tool' }]),
      handleToolCall: vi.fn(),
    }
    mockActionWordTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'action_word_tool' }]),
      handleToolCall: vi.fn(),
    }
    mockTestRunTools = {
      getTools: vi.fn().mockReturnValue([{ name: 'test_run_tool' }]),
      handleToolCall: vi.fn(),
    }

    // Mock transport
    mockStdioTransport = {
      start: vi.fn(),
    }

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
      logging: {
        level: 'info' as const,
        logApiResponses: false,
        logRequestBodies: false,
        logResponseBodies: false,
        transport: 'stderr' as const,
      },
    }

    // Set up mock implementations
    vi.mocked(Server).mockImplementation(() => mockServer)
    vi.mocked(configManager.loadFromEnvironment).mockReturnValue(mockConfig)
    vi.mocked(CucumberStudioApiClient).mockImplementation(() => mockApiClient)
    vi.mocked(validateEnvironment).mockImplementation(() => {})
    vi.mocked(StdioTransport).mockImplementation(() => mockStdioTransport)
    vi.mocked(ProjectTools).mockImplementation(() => mockProjectTools)
    vi.mocked(ScenarioTools).mockImplementation(() => mockScenarioTools)
    vi.mocked(ActionWordTools).mockImplementation(() => mockActionWordTools)
    vi.mocked(TestRunTools).mockImplementation(() => mockTestRunTools)
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create MCP server with correct configuration', () => {
      new CucumberStudioMcpServer()

      expect(Server).toHaveBeenCalledWith(
        {
          name: 'cucumberstudio-mcp',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        },
      )
    })

    it('should set up tool handlers', () => {
      new CucumberStudioMcpServer()

      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2)
    })
  })

  describe('createServer', () => {
    it('should create and return a new server instance', () => {
      const server = CucumberStudioMcpServer.createServer()

      expect(server).toBeDefined()
      expect(Server).toHaveBeenCalled()
    })
  })

  describe('initialize', () => {
    it('should initialize all components successfully', async () => {
      const server = new CucumberStudioMcpServer()

      await server.initialize()

      // Connection testing is now deferred until tools are actually used
      expect(mockApiClient.testConnection).not.toHaveBeenCalled()
    })

    it('should initialize successfully even if API would fail', async () => {
      // API connection is not tested during initialization anymore
      mockApiClient.testConnection.mockResolvedValue(false)

      const server = new CucumberStudioMcpServer()

      // Should not throw since connection is not tested during init
      await expect(server.initialize()).resolves.not.toThrow()
    })
  })

  describe('runWithTransport', () => {
    it('should start stdio transport', async () => {
      const server = new CucumberStudioMcpServer()
      await server.initialize()

      await server.runWithTransport('stdio')

      expect(mockStdioTransport.start).toHaveBeenCalled()
    })

    it('should throw error for unsupported transport in instance mode', async () => {
      const server = new CucumberStudioMcpServer()
      await server.initialize()

      await expect(server.runWithTransport('http' as any)).rejects.toThrow(
        'Transport http not supported in instance mode',
      )
    })
  })

  describe('getServer', () => {
    it('should return the server instance', () => {
      const server = new CucumberStudioMcpServer()
      const mcpServer = server.getServer()

      expect(mcpServer).toBe(mockServer)
    })
  })
})
