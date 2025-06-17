import { Tool, CallToolRequest, CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

import { CucumberStudioApiClient } from '../api/client.js'
import { Scenario } from '../api/types.js'
import { safeExecute } from '../utils/errors.js'
import {
  validateInput,
  ProjectIdSchema,
  ScenarioIdSchema,
  ListParamsSchema,
  convertToApiParams,
} from '../utils/validation.js'

const FindByTagsSchema = z.object({
  projectId: ProjectIdSchema,
  tags: z.string().min(1, 'Tags parameter is required'),
  pagination: z
    .object({
      page: z.number().int().min(1).optional(),
      pageSize: z.number().int().min(1).max(100).optional(),
    })
    .optional(),
})

export class ScenarioTools {
  constructor(private apiClient: CucumberStudioApiClient) {}

  /**
   * Get all available MCP tools for scenarios
   */
  getTools(): Tool[] {
    return [
      {
        name: 'cucumberstudio_list_scenarios',
        description: 'List all scenarios in a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', minimum: 1, description: 'Page number' },
                pageSize: { type: 'number', minimum: 1, maximum: 100, description: 'Number of items per page' },
              },
              additionalProperties: false,
            },
            filter: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Filter scenarios by name' },
                tags: { type: 'string', description: 'Filter scenarios by tags' },
              },
              additionalProperties: false,
            },
          },
          required: ['projectId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_get_scenario',
        description: 'Get detailed information about a specific scenario',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            scenarioId: { type: 'string', description: 'The ID of the scenario to retrieve' },
          },
          required: ['projectId', 'scenarioId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_find_scenarios_by_tags',
        description: 'Find scenarios by tags in a project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            tags: { type: 'string', description: 'Tags to search for (comma-separated)' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', minimum: 1, description: 'Page number' },
                pageSize: { type: 'number', minimum: 1, maximum: 100, description: 'Number of items per page' },
              },
              additionalProperties: false,
            },
          },
          required: ['projectId', 'tags'],
          additionalProperties: false,
        },
      },
    ]
  }

  /**
   * Handle tool calls for scenario-related operations
   */
  async handleToolCall(request: CallToolRequest): Promise<CallToolResult> {
    switch (request.params.name) {
      case 'cucumberstudio_list_scenarios':
        return this.listScenarios(request.params.arguments)

      case 'cucumberstudio_get_scenario':
        return this.getScenario(request.params.arguments)

      case 'cucumberstudio_find_scenarios_by_tags':
        return this.findScenariosByTags(request.params.arguments)

      default:
        throw new Error(`Unknown tool: ${request.params.name}`)
    }
  }

  async listScenarios(args: unknown): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, (args as Record<string, unknown>)?.projectId, 'list_scenarios')
      const listParams = validateInput(ListParamsSchema, args, 'list_scenarios')
      const apiParams = convertToApiParams(listParams)

      const response = await this.apiClient.getScenarios(projectId, apiParams)

      const scenarios = Array.isArray(response.data) ? response.data : [response.data]
      const scenarioList = scenarios.map((scenario: Scenario) => ({
        id: scenario.id,
        name: scenario.attributes.name,
        description: scenario.attributes.description || '',
        definition: scenario.attributes.definition || '',
        folder_id: scenario.attributes.folder_id,
        created_at: scenario.attributes.created_at,
        updated_at: scenario.attributes.updated_at,
      }))

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                scenarios: scenarioList,
                meta: response.meta || {},
                total_count: scenarioList.length,
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'listing scenarios')
  }

  async getScenario(args: unknown): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, (args as Record<string, unknown>)?.projectId, 'get_scenario')
      const scenarioId = validateInput(ScenarioIdSchema, (args as Record<string, unknown>)?.scenarioId, 'get_scenario')

      const response = await this.apiClient.getScenario(projectId, scenarioId)

      const scenario = response.data
      const scenarioDetails = {
        id: scenario.id,
        type: scenario.type,
        name: scenario.attributes.name,
        description: scenario.attributes.description || '',
        definition: scenario.attributes.definition || '',
        folder_id: scenario.attributes.folder_id,
        created_at: scenario.attributes.created_at,
        updated_at: scenario.attributes.updated_at,
        relationships: scenario.relationships || {},
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                scenario: scenarioDetails,
                included: response.included || [],
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'getting scenario details')
  }

  async findScenariosByTags(args: unknown): Promise<CallToolResult> {
    return safeExecute(async () => {
      const { projectId, tags, pagination } = validateInput(FindByTagsSchema, args, 'find_scenarios_by_tags')
      const apiParams = convertToApiParams({ pagination })

      const response = await this.apiClient.findScenariosByTag(projectId, tags, apiParams)

      const scenarios = Array.isArray(response.data) ? response.data : [response.data]
      const scenarioList = scenarios.map((scenario: Scenario) => ({
        id: scenario.id,
        name: scenario.attributes.name,
        description: scenario.attributes.description || '',
        definition: scenario.attributes.definition || '',
        folder_id: scenario.attributes.folder_id,
        created_at: scenario.attributes.created_at,
        updated_at: scenario.attributes.updated_at,
      }))

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                scenarios: scenarioList,
                search_tags: tags,
                meta: response.meta || {},
                total_count: scenarioList.length,
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'finding scenarios by tags')
  }
}
