import { Tool, CallToolRequest, CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'

import { CucumberStudioApiClient } from '../api/client.js'
import { ActionWord } from '../api/types.js'
import { safeExecute } from '../utils/errors.js'
import {
  validateInput,
  ProjectIdSchema,
  ActionWordIdSchema,
  ListParamsSchema,
  convertToApiParams,
} from '../utils/validation.js'

const FindActionWordsByTagsSchema = z.object({
  projectId: ProjectIdSchema,
  tags: z.string().min(1, 'Tags parameter is required'),
  pagination: z
    .object({
      page: z.number().int().min(1).optional(),
      pageSize: z.number().int().min(1).max(100).optional(),
    })
    .optional(),
})

export class ActionWordTools {
  constructor(private apiClient: CucumberStudioApiClient) {}

  /**
   * Get all available MCP tools for action words
   */
  getTools(): Tool[] {
    return [
      {
        name: 'cucumberstudio_list_action_words',
        description: 'List all action words (reusable test steps) in a project',
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
                name: { type: 'string', description: 'Filter action words by name' },
                tags: { type: 'string', description: 'Filter action words by tags' },
              },
              additionalProperties: false,
            },
          },
          required: ['projectId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_get_action_word',
        description: 'Get detailed information about a specific action word',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            actionWordId: { type: 'string', description: 'The ID of the action word to retrieve' },
          },
          required: ['projectId', 'actionWordId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_find_action_words_by_tags',
        description: 'Find action words by tags in a project',
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
   * Handle tool calls for action word-related operations
   */
  async handleToolCall(request: CallToolRequest): Promise<CallToolResult> {
    switch (request.params.name) {
      case 'cucumberstudio_list_action_words':
        return this.listActionWords(request.params.arguments)

      case 'cucumberstudio_get_action_word':
        return this.getActionWord(request.params.arguments)

      case 'cucumberstudio_find_action_words_by_tags':
        return this.findActionWordsByTags(request.params.arguments)

      default:
        throw new Error(`Unknown tool: ${request.params.name}`)
    }
  }

  private async listActionWords(args: unknown): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, (args as Record<string, unknown>)?.projectId, 'list_action_words')
      const listParams = validateInput(ListParamsSchema, args, 'list_action_words')
      const apiParams = convertToApiParams(listParams)

      const response = await this.apiClient.getActionWords(projectId, apiParams)

      const actionWords = Array.isArray(response.data) ? response.data : [response.data]
      const actionWordList = actionWords.map((actionWord: ActionWord) => ({
        id: actionWord.id,
        name: actionWord.attributes.name,
        description: actionWord.attributes.description || '',
        definition: actionWord.attributes.definition || '',
        created_at: actionWord.attributes.created_at,
        updated_at: actionWord.attributes.updated_at,
      }))

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                action_words: actionWordList,
                meta: response.meta || {},
                total_count: actionWordList.length,
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'listing action words')
  }

  private async getActionWord(args: unknown): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, (args as Record<string, unknown>)?.projectId, 'get_action_word')
      const actionWordId = validateInput(ActionWordIdSchema, (args as Record<string, unknown>)?.actionWordId, 'get_action_word')

      const response = await this.apiClient.getActionWord(projectId, actionWordId)

      const actionWord = response.data as ActionWord
      const actionWordDetails = {
        id: actionWord.id,
        type: actionWord.type,
        name: actionWord.attributes.name,
        description: actionWord.attributes.description || '',
        definition: actionWord.attributes.definition || '',
        created_at: actionWord.attributes.created_at,
        updated_at: actionWord.attributes.updated_at,
        relationships: actionWord.relationships || {},
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                action_word: actionWordDetails,
                included: response.included || [],
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'getting action word details')
  }

  private async findActionWordsByTags(args: unknown): Promise<CallToolResult> {
    return safeExecute(async () => {
      const { projectId, tags, pagination } = validateInput(
        FindActionWordsByTagsSchema,
        args,
        'find_action_words_by_tags',
      )
      const apiParams = convertToApiParams({ pagination })

      const response = await this.apiClient.findActionWordsByTag(projectId, tags, apiParams)

      const actionWords = Array.isArray(response.data) ? response.data : [response.data]
      const actionWordList = actionWords.map((actionWord: ActionWord) => ({
        id: actionWord.id,
        name: actionWord.attributes.name,
        description: actionWord.attributes.description || '',
        definition: actionWord.attributes.definition || '',
        created_at: actionWord.attributes.created_at,
        updated_at: actionWord.attributes.updated_at,
      }))

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                action_words: actionWordList,
                search_tags: tags,
                meta: response.meta || {},
                total_count: actionWordList.length,
              },
              null,
              2,
            ),
          } as TextContent,
        ],
      }
    }, 'finding action words by tags')
  }
}
