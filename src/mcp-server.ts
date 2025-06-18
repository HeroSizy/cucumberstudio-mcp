import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { CucumberStudioApiClient } from './api/client.js'
import { configManager } from './config/settings.js'
import { SERVER_NAME, SERVER_VERSION, LOG_PREFIX } from './constants.js'
import { ActionWordTools } from './tools/action-words.js'
import { ProjectTools } from './tools/projects.js'
import { ScenarioTools } from './tools/scenarios.js'
import { TestRunTools } from './tools/test-runs.js'
import { StderrLogger, getLogLevel } from './utils/logger.js'
import { validateEnvironment } from './utils/validation.js'

/**
 * Create and configure a new CucumberStudio MCP Server
 */
export function createCucumberStudioMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  })

  // Initialize server tools asynchronously
  initializeServerTools(server).catch((error) => {
    console.error('❌ Failed to initialize server tools:', error)
  })

  return server
}

/**
 * Initialize all tools and register them with the server
 */
async function initializeServerTools(server: McpServer): Promise<void> {
  // Validate environment variables
  validateEnvironment()

  // Load configuration
  const config = configManager.loadFromEnvironment()

  // Initialize API client
  const apiLogger = new StderrLogger({ level: getLogLevel(), prefix: LOG_PREFIX })
  const apiClient = new CucumberStudioApiClient(config, apiLogger)

  // Initialize tool classes
  const projectTools = new ProjectTools(apiClient)
  const scenarioTools = new ScenarioTools(apiClient)
  const actionWordTools = new ActionWordTools(apiClient)
  const testRunTools = new TestRunTools(apiClient)

  // Register all tools
  registerProjectTools(server, projectTools)
  registerScenarioTools(server, scenarioTools)
  registerActionWordTools(server, actionWordTools)
  registerTestRunTools(server, testRunTools)

  console.error('✅ CucumberStudio MCP Server tools initialized')
}

/**
 * Register project-related tools
 */
function registerProjectTools(server: McpServer, projectTools: ProjectTools): void {
  server.registerTool(
    'cucumberstudio_list_projects',
    {
      description: 'List all projects accessible to the authenticated user',
      inputSchema: {
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
        filter: z
          .object({
            name: z.string().optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await projectTools.listProjects(args || {})
    },
  )

  server.registerTool(
    'cucumberstudio_get_project',
    {
      description: 'Get detailed information about a specific project',
      inputSchema: {
        projectId: z.string(),
      },
    },
    async (args) => {
      return await projectTools.getProject(args)
    },
  )
}

/**
 * Register scenario-related tools
 */
function registerScenarioTools(server: McpServer, scenarioTools: ScenarioTools): void {
  server.registerTool(
    'cucumberstudio_list_scenarios',
    {
      description: 'List all scenarios in a project',
      inputSchema: {
        projectId: z.string(),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
        filter: z
          .object({
            name: z.string().optional(),
            tags: z.string().optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await scenarioTools.listScenarios(args)
    },
  )

  server.registerTool(
    'cucumberstudio_get_scenario',
    {
      description: 'Get detailed information about a specific scenario',
      inputSchema: {
        projectId: z.string(),
        scenarioId: z.string(),
      },
    },
    async (args) => {
      return await scenarioTools.getScenario(args)
    },
  )

  server.registerTool(
    'cucumberstudio_find_scenarios_by_tags',
    {
      description: 'Find scenarios by tags in a project',
      inputSchema: {
        projectId: z.string(),
        tags: z.string().min(1),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await scenarioTools.findScenariosByTags(args)
    },
  )
}

/**
 * Register action word-related tools
 */
function registerActionWordTools(server: McpServer, actionWordTools: ActionWordTools): void {
  server.registerTool(
    'cucumberstudio_list_action_words',
    {
      description: 'List all action words (reusable test steps) in a project',
      inputSchema: {
        projectId: z.string(),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
        filter: z
          .object({
            name: z.string().optional(),
            tags: z.string().optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await actionWordTools.listActionWords(args)
    },
  )

  server.registerTool(
    'cucumberstudio_get_action_word',
    {
      description: 'Get detailed information about a specific action word',
      inputSchema: {
        projectId: z.string(),
        actionWordId: z.string(),
      },
    },
    async (args) => {
      return await actionWordTools.getActionWord(args)
    },
  )

  server.registerTool(
    'cucumberstudio_find_action_words_by_tags',
    {
      description: 'Find action words by tags in a project',
      inputSchema: {
        projectId: z.string(),
        tags: z.string().min(1),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await actionWordTools.findActionWordsByTags(args)
    },
  )
}

/**
 * Register test run-related tools
 */
function registerTestRunTools(server: McpServer, testRunTools: TestRunTools): void {
  server.registerTool(
    'cucumberstudio_list_test_runs',
    {
      description: 'List all test runs in a project',
      inputSchema: {
        projectId: z.string(),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
        filter: z
          .object({
            name: z.string().optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await testRunTools.listTestRuns(args)
    },
  )

  server.registerTool(
    'cucumberstudio_get_test_run',
    {
      description: 'Get detailed information about a specific test run',
      inputSchema: {
        projectId: z.string(),
        testRunId: z.string(),
      },
    },
    async (args) => {
      return await testRunTools.getTestRun(args)
    },
  )

  server.registerTool(
    'cucumberstudio_get_test_executions',
    {
      description: 'Get test executions (individual test results) for a test run',
      inputSchema: {
        projectId: z.string(),
        testRunId: z.string(),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await testRunTools.getTestExecutions(args)
    },
  )

  server.registerTool(
    'cucumberstudio_list_builds',
    {
      description: 'List all builds in a project',
      inputSchema: {
        projectId: z.string(),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await testRunTools.listBuilds(args)
    },
  )

  server.registerTool(
    'cucumberstudio_get_build',
    {
      description: 'Get detailed information about a specific build',
      inputSchema: {
        projectId: z.string(),
        buildId: z.string(),
      },
    },
    async (args) => {
      return await testRunTools.getBuild(args)
    },
  )

  server.registerTool(
    'cucumberstudio_list_execution_environments',
    {
      description: 'List all execution environments in a project',
      inputSchema: {
        projectId: z.string(),
        pagination: z
          .object({
            page: z.number().min(1).optional(),
            pageSize: z.number().min(1).max(100).optional(),
          })
          .optional(),
      },
    },
    async (args) => {
      return await testRunTools.listExecutionEnvironments(args)
    },
  )
}
