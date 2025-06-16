import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ScenarioTools } from '@/tools/scenarios.js'
import { ActionWordTools } from '@/tools/action-words.js'
import { TestRunTools } from '@/tools/test-runs.js'
import { CucumberStudioApiClient } from '@/api/client.js'

// Mock the API client
vi.mock('@/api/client.js')

describe('Tools Basic Functionality', () => {
  let mockApiClient: any

  beforeEach(() => {
    mockApiClient = {
      getProjects: vi.fn(),
      getProject: vi.fn(),
      getScenarios: vi.fn(),
      getScenario: vi.fn(),
      getFolders: vi.fn(),
      getActionWords: vi.fn(),
      getActionWord: vi.fn(),
      getTestRuns: vi.fn(),
      getTestRun: vi.fn(),
      getTestExecutions: vi.fn(),
      getBuilds: vi.fn(),
      getBuild: vi.fn(),
      getExecutionEnvironments: vi.fn(),
    }
  })

  describe('ScenarioTools', () => {
    it('should instantiate and provide tools', () => {
      const scenarioTools = new ScenarioTools(mockApiClient)
      const tools = scenarioTools.getTools()

      expect(tools).toBeDefined()
      expect(Array.isArray(tools)).toBe(true)
      expect(tools.length).toBeGreaterThan(0)

      // Check that all tools have required properties
      tools.forEach((tool) => {
        expect(tool.name).toBeDefined()
        expect(tool.description).toBeDefined()
        expect(tool.inputSchema).toBeDefined()
      })
    })

    it('should have scenario-related tool names', () => {
      const scenarioTools = new ScenarioTools(mockApiClient)
      const tools = scenarioTools.getTools()
      const toolNames = tools.map((tool) => tool.name)

      expect(toolNames.some((name) => name.includes('scenario'))).toBe(true)
    })

    it('should throw error for unknown tool', async () => {
      const scenarioTools = new ScenarioTools(mockApiClient)

      await expect(scenarioTools.handleToolCall('unknown_tool', {})).rejects.toThrow()
    })
  })

  describe('ActionWordTools', () => {
    it('should instantiate and provide tools', () => {
      const actionWordTools = new ActionWordTools(mockApiClient)
      const tools = actionWordTools.getTools()

      expect(tools).toBeDefined()
      expect(Array.isArray(tools)).toBe(true)
      expect(tools.length).toBeGreaterThan(0)

      tools.forEach((tool) => {
        expect(tool.name).toBeDefined()
        expect(tool.description).toBeDefined()
        expect(tool.inputSchema).toBeDefined()
      })
    })

    it('should have action word related tool names', () => {
      const actionWordTools = new ActionWordTools(mockApiClient)
      const tools = actionWordTools.getTools()
      const toolNames = tools.map((tool) => tool.name)

      expect(toolNames.some((name) => name.includes('action_word'))).toBe(true)
    })

    it('should throw error for unknown tool', async () => {
      const actionWordTools = new ActionWordTools(mockApiClient)

      await expect(actionWordTools.handleToolCall('unknown_tool', {})).rejects.toThrow()
    })
  })

  describe('TestRunTools', () => {
    it('should instantiate and provide tools', () => {
      const testRunTools = new TestRunTools(mockApiClient)
      const tools = testRunTools.getTools()

      expect(tools).toBeDefined()
      expect(Array.isArray(tools)).toBe(true)
      expect(tools.length).toBeGreaterThan(0)

      tools.forEach((tool) => {
        expect(tool.name).toBeDefined()
        expect(tool.description).toBeDefined()
        expect(tool.inputSchema).toBeDefined()
      })
    })

    it('should have test run related tool names', () => {
      const testRunTools = new TestRunTools(mockApiClient)
      const tools = testRunTools.getTools()
      const toolNames = tools.map((tool) => tool.name)

      expect(toolNames.some((name) => name.includes('test_run') || name.includes('build'))).toBe(true)
    })

    it('should throw error for unknown tool', async () => {
      const testRunTools = new TestRunTools(mockApiClient)

      await expect(testRunTools.handleToolCall('unknown_tool', {})).rejects.toThrow()
    })
  })
})