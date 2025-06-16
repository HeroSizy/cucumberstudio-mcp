import {
  Tool,
  CallToolRequest,
  CallToolResult,
  TextContent,
} from '@modelcontextprotocol/sdk/types.js';
import { CucumberStudioApiClient } from '../api/client.js';
import { safeExecute } from '../utils/errors.js';
import { 
  validateInput, 
  ProjectIdSchema, 
  TestRunIdSchema, 
  BuildIdSchema,
  ListParamsSchema, 
  convertToApiParams 
} from '../utils/validation.js';

export class TestRunTools {
  constructor(private apiClient: CucumberStudioApiClient) {}

  /**
   * Get all available MCP tools for test runs
   */
  getTools(): Tool[] {
    return [
      {
        name: 'cucumberstudio_list_test_runs',
        description: 'List all test runs in a project',
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
                name: { type: 'string', description: 'Filter test runs by name' },
              },
              additionalProperties: false,
            },
          },
          required: ['projectId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_get_test_run',
        description: 'Get detailed information about a specific test run',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            testRunId: { type: 'string', description: 'The ID of the test run to retrieve' },
          },
          required: ['projectId', 'testRunId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_get_test_executions',
        description: 'Get test executions (individual test results) for a test run',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            testRunId: { type: 'string', description: 'The ID of the test run' },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', minimum: 1, description: 'Page number' },
                pageSize: { type: 'number', minimum: 1, maximum: 100, description: 'Number of items per page' },
              },
              additionalProperties: false,
            },
          },
          required: ['projectId', 'testRunId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_list_builds',
        description: 'List all builds in a project',
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
          },
          required: ['projectId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_get_build',
        description: 'Get detailed information about a specific build',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'The ID of the project' },
            buildId: { type: 'string', description: 'The ID of the build to retrieve' },
          },
          required: ['projectId', 'buildId'],
          additionalProperties: false,
        },
      },
      {
        name: 'cucumberstudio_list_execution_environments',
        description: 'List all execution environments in a project',
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
          },
          required: ['projectId'],
          additionalProperties: false,
        },
      },
    ];
  }

  /**
   * Handle tool calls for test run-related operations
   */
  async handleToolCall(request: CallToolRequest): Promise<CallToolResult> {
    switch (request.params.name) {
      case 'cucumberstudio_list_test_runs':
        return this.listTestRuns(request.params.arguments);

      case 'cucumberstudio_get_test_run':
        return this.getTestRun(request.params.arguments);

      case 'cucumberstudio_get_test_executions':
        return this.getTestExecutions(request.params.arguments);

      case 'cucumberstudio_list_builds':
        return this.listBuilds(request.params.arguments);

      case 'cucumberstudio_get_build':
        return this.getBuild(request.params.arguments);

      case 'cucumberstudio_list_execution_environments':
        return this.listExecutionEnvironments(request.params.arguments);

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  }

  private async listTestRuns(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, args?.projectId, 'list_test_runs');
      const listParams = validateInput(ListParamsSchema, args, 'list_test_runs');
      const apiParams = convertToApiParams(listParams);
      
      const response = await this.apiClient.getTestRuns(projectId, apiParams);
      
      const testRuns = Array.isArray(response.data) ? response.data : [response.data];
      const testRunList = testRuns.map((testRun: any) => ({
        id: testRun.id,
        name: testRun.attributes?.name || 'Unknown',
        description: testRun.attributes?.description || '',
        execution_environment: testRun.attributes?.execution_environment || '',
        created_at: testRun.attributes?.created_at,
        updated_at: testRun.attributes?.updated_at,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              test_runs: testRunList,
              meta: response.meta || {},
              total_count: testRunList.length,
            }, null, 2),
          } as TextContent,
        ],
      };
    }, 'listing test runs');
  }

  private async getTestRun(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, args?.projectId, 'get_test_run');
      const testRunId = validateInput(TestRunIdSchema, args?.testRunId, 'get_test_run');
      
      const response = await this.apiClient.getTestRun(projectId, testRunId);
      
      const testRun = response.data;
      const testRunDetails = {
        id: testRun.id,
        type: testRun.type,
        name: testRun.attributes?.name || 'Unknown',
        description: testRun.attributes?.description || '',
        execution_environment: testRun.attributes?.execution_environment || '',
        created_at: testRun.attributes?.created_at,
        updated_at: testRun.attributes?.updated_at,
        relationships: testRun.relationships || {},
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              test_run: testRunDetails,
              included: response.included || [],
            }, null, 2),
          } as TextContent,
        ],
      };
    }, 'getting test run details');
  }

  private async getTestExecutions(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, args?.projectId, 'get_test_executions');
      const testRunId = validateInput(TestRunIdSchema, args?.testRunId, 'get_test_executions');
      const listParams = validateInput(ListParamsSchema, args, 'get_test_executions');
      const apiParams = convertToApiParams(listParams);
      
      const response = await this.apiClient.getTestExecutions(projectId, testRunId, apiParams);
      
      const executions = Array.isArray(response.data) ? response.data : [response.data];
      const executionList = executions.map((execution: any) => ({
        id: execution.id,
        status: execution.attributes?.status || 'unknown',
        scenario_id: execution.attributes?.scenario_id,
        test_run_id: execution.attributes?.test_run_id,
        created_at: execution.attributes?.created_at,
        updated_at: execution.attributes?.updated_at,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              test_executions: executionList,
              test_run_id: testRunId,
              meta: response.meta || {},
              total_count: executionList.length,
            }, null, 2),
          } as TextContent,
        ],
      };
    }, 'getting test executions');
  }

  private async listBuilds(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, args?.projectId, 'list_builds');
      const listParams = validateInput(ListParamsSchema, args, 'list_builds');
      const apiParams = convertToApiParams(listParams);
      
      const response = await this.apiClient.getBuilds(projectId, apiParams);
      
      const builds = Array.isArray(response.data) ? response.data : [response.data];
      const buildList = builds.map((build: any) => ({
        id: build.id,
        name: build.attributes?.name || 'Unknown',
        created_at: build.attributes?.created_at,
        updated_at: build.attributes?.updated_at,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              builds: buildList,
              meta: response.meta || {},
              total_count: buildList.length,
            }, null, 2),
          } as TextContent,
        ],
      };
    }, 'listing builds');
  }

  private async getBuild(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, args?.projectId, 'get_build');
      const buildId = validateInput(BuildIdSchema, args?.buildId, 'get_build');
      
      const response = await this.apiClient.getBuild(projectId, buildId);
      
      const build = response.data;
      const buildDetails = {
        id: build.id,
        type: build.type,
        name: build.attributes?.name || 'Unknown',
        created_at: build.attributes?.created_at,
        updated_at: build.attributes?.updated_at,
        relationships: build.relationships || {},
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              build: buildDetails,
              included: response.included || [],
            }, null, 2),
          } as TextContent,
        ],
      };
    }, 'getting build details');
  }

  private async listExecutionEnvironments(args: any): Promise<CallToolResult> {
    return safeExecute(async () => {
      const projectId = validateInput(ProjectIdSchema, args?.projectId, 'list_execution_environments');
      const listParams = validateInput(ListParamsSchema, args, 'list_execution_environments');
      const apiParams = convertToApiParams(listParams);
      
      const response = await this.apiClient.getExecutionEnvironments(projectId, apiParams);
      
      const environments = Array.isArray(response.data) ? response.data : [response.data];
      const environmentList = environments.map((env: any) => ({
        id: env.id,
        name: env.attributes?.name || 'Unknown',
        created_at: env.attributes?.created_at,
        updated_at: env.attributes?.updated_at,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              execution_environments: environmentList,
              meta: response.meta || {},
              total_count: environmentList.length,
            }, null, 2),
          } as TextContent,
        ],
      };
    }, 'listing execution environments');
  }
}