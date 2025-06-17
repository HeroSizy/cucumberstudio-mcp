import { Tool, CallToolRequest, CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js'

import { CucumberStudioApiClient } from '../api/client.js'
import { safeExecute } from '../utils/errors.js'
import { validateInput, ProjectIdSchema, ListParamsSchema, convertToApiParams } from '../utils/validation.js'

export class ProjectTools {
  constructor(private apiClient: CucumberStudioApiClient) {}

  /**
   * Get all available MCP tools for projects
   */
  getTools(): Tool[] {
    return [
      {
        name: 'cucumberstudio_list_projects',
        description: 'List all projects accessible to the authenticated user',
        inputSchema: {
          type: 'object',
          properties: {
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
                name: { type: 'string', description: 'Filter projects by name' },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_get_project',
        description: 'Get detailed information about a specific project',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project to retrieve' },
          },
          required: ['projectId'],
          additionalProperties: false,
        },
      },
    ]
  }

  /**
   * Handle tool calls for project-related operations
   */
  async handleToolCall(request: CallToolRequest): Promise<CallToolResult> {
    switch (request.params.name) {
      case 'cucumberstudio_list_projects':
        return this.listProjects(request.params.arguments)

      case 'cucumberstudio_get_project':
        return this.getProject(request.params.arguments)

      default:
        throw new Error(`Unknown tool: ${request.params.name}`)
    }
  }

  private async listProjects(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const params = validateInput(ListParamsSchema, args, 'list_projects')
      const apiParams = convertToApiParams(params)

      const response = await this.apiClient.getProjects(apiParams)

      const projects = Array.isArray(response.data) ? response.data : [response.data]
      const projectList = projects.map((project: any) => ({
        id: project.id,
        name: project.attributes?.name || 'Unknown',
        description: project.attributes?.description || '',
        created_at: project.attributes?.created_at,
        updated_at: project.attributes?.updated_at,
      }))

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                projects: projectList,
                meta: response.meta || {},
                total_count: projectList.length,
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'listing projects')
  }

  private async getProject(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, args?.projectId, 'get_project')

      const response = await this.apiClient.getProject(projectId)

      const project = response.data
      const projectDetails = {
        id: project.id,
        type: project.type,
        name: project.attributes?.name || 'Unknown',
        description: project.attributes?.description || '',
        created_at: project.attributes?.created_at,
        updated_at: project.attributes?.updated_at,
        relationships: project.relationships || {},
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                project: projectDetails,
                included: response.included || [],
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'getting project details')
  }
}
