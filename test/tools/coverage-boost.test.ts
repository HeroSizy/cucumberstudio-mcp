import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ScenarioTools } from '@/tools/scenarios.js'
import { ActionWordTools } from '@/tools/action-words.js'
import { TestRunTools } from '@/tools/test-runs.js'
import { CucumberStudioApiClient } from '@/api/client.js'
import { CallToolRequest } from '@modelcontextprotocol/sdk/types.js'

// Mock the API client
vi.mock('@/api/client.js')

describe('Tools Coverage Boost', () => {
  let mockApiClient: any
  
  beforeEach(() => {
    mockApiClient = {
      getScenarios: vi.fn().mockResolvedValue({ data: [] }),
      getScenario: vi.fn().mockResolvedValue({ data: { id: 1, attributes: { name: 'Test' } } }),
      findScenariosByTag: vi.fn().mockResolvedValue({ data: [] }),
      getActionWords: vi.fn().mockResolvedValue({ data: [] }),
      getActionWord: vi.fn().mockResolvedValue({ data: { id: 1, attributes: { name: 'Test' } } }),
      findActionWordsByTag: vi.fn().mockResolvedValue({ data: [] }),
      getTestRuns: vi.fn().mockResolvedValue({ data: [] }),
      getTestRun: vi.fn().mockResolvedValue({ data: { id: 1, attributes: { name: 'Test' } } }),
      getTestExecutions: vi.fn().mockResolvedValue({ data: [] }),
      getBuilds: vi.fn().mockResolvedValue({ data: [] }),
      getBuild: vi.fn().mockResolvedValue({ data: { id: 1, attributes: { name: 'Test' } } }),
      getExecutionEnvironments: vi.fn().mockResolvedValue({ data: [] }),
    }
  })

  describe('ScenarioTools handleToolCall', () => {
    let scenarioTools: ScenarioTools

    beforeEach(() => {
      scenarioTools = new ScenarioTools(mockApiClient)
    })

    it('should handle cucumberstudio_list_scenarios', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_list_scenarios',
          arguments: { projectId: '1' },
        },
      }

      const result = await scenarioTools.handleToolCall(request)
      expect(result.content).toBeDefined()
      expect(result.content[0].type).toBe('text')
    })

    it('should handle cucumberstudio_get_scenario', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_get_scenario',
          arguments: { projectId: '1', scenarioId: '1' },
        },
      }

      const result = await scenarioTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should handle cucumberstudio_find_scenarios_by_tags', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_find_scenarios_by_tags',
          arguments: { projectId: '1', tags: 'test' },
        },
      }

      const result = await scenarioTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    // Note: cucumberstudio_list_folders is not implemented in ScenarioTools

    it('should throw for unknown scenario tool', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'unknown_scenario_tool',
          arguments: {},
        },
      }

      await expect(scenarioTools.handleToolCall(request)).rejects.toThrow()
    })
  })

  describe('ActionWordTools handleToolCall', () => {
    let actionWordTools: ActionWordTools

    beforeEach(() => {
      actionWordTools = new ActionWordTools(mockApiClient)
    })

    it('should handle cucumberstudio_list_action_words', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_list_action_words',
          arguments: { projectId: '1' },
        },
      }

      const result = await actionWordTools.handleToolCall(request)
      expect(result.content).toBeDefined()
      expect(result.content[0].type).toBe('text')
    })

    it('should handle cucumberstudio_get_action_word', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_get_action_word',
          arguments: { projectId: '1', actionWordId: '1' },
        },
      }

      const result = await actionWordTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should handle cucumberstudio_find_action_words_by_tags', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_find_action_words_by_tags',
          arguments: { projectId: '1', tags: 'test' },
        },
      }

      const result = await actionWordTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should throw for unknown action word tool', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'unknown_action_word_tool',
          arguments: {},
        },
      }

      await expect(actionWordTools.handleToolCall(request)).rejects.toThrow()
    })
  })

  describe('TestRunTools handleToolCall', () => {
    let testRunTools: TestRunTools

    beforeEach(() => {
      testRunTools = new TestRunTools(mockApiClient)
    })

    it('should handle cucumberstudio_list_test_runs', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_list_test_runs',
          arguments: { projectId: '1' },
        },
      }

      const result = await testRunTools.handleToolCall(request)
      expect(result.content).toBeDefined()
      expect(result.content[0].type).toBe('text')
    })

    it('should handle cucumberstudio_get_test_run', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_get_test_run',
          arguments: { projectId: '1', testRunId: '1' },
        },
      }

      const result = await testRunTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should handle cucumberstudio_get_test_executions', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_get_test_executions',
          arguments: { projectId: '1', testRunId: '1' },
        },
      }

      const result = await testRunTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should handle cucumberstudio_list_builds', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_list_builds',
          arguments: { projectId: '1' },
        },
      }

      const result = await testRunTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should handle cucumberstudio_get_build', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_get_build',
          arguments: { projectId: '1', buildId: '1' },
        },
      }

      const result = await testRunTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should handle cucumberstudio_list_execution_environments', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_list_execution_environments',
          arguments: { projectId: '1' },
        },
      }

      const result = await testRunTools.handleToolCall(request)
      expect(result.content).toBeDefined()
    })

    it('should throw for unknown test run tool', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'unknown_test_run_tool',
          arguments: {},
        },
      }

      await expect(testRunTools.handleToolCall(request)).rejects.toThrow()
    })
  })
})