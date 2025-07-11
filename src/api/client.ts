import axios, { AxiosInstance, AxiosResponse } from 'axios'

import { Config } from '../config/settings.js'
import { API_VERSION_HEADER, API_TIMEOUT, REDACTED_STRING } from '../constants.js'
import { Logger } from '../utils/logger.js'

import {
  CucumberStudioResponse,
  CucumberStudioError,
  ListParams,
  Project,
  Scenario,
  ActionWord,
  Folder,
  TestRun,
  TestExecution,
  Build,
  ExecutionEnvironment,
} from './types.js'

export class CucumberStudioApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: CucumberStudioError,
  ) {
    super(message)
    this.name = 'CucumberStudioApiError'
  }
}

export class CucumberStudioApiClient {
  private client: AxiosInstance

  constructor(
    private config: Config,
    private logger: Logger,
  ) {
    this.client = axios.create({
      baseURL: config.cucumberStudio.baseUrl,
      headers: {
        Accept: API_VERSION_HEADER,
        'Content-Type': 'application/json',
        'access-token': config.cucumberStudio.accessToken,
        client: config.cucumberStudio.clientId,
        uid: config.cucumberStudio.uid,
      },
      timeout: API_TIMEOUT,
    })

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: this.sanitizeHeaders(config.headers),
          params: config.params,
          bodySize: config.data ? JSON.stringify(config.data).length : 0,
        })

        if (this.getLoggingConfig().logRequestBodies && config.data) {
          this.logger.trace('📤 Request Body:', config.data)
        }

        return config
      },
      (error) => {
        this.logger.error('❌ Request Error:', error)
        return Promise.reject(error)
      },
    )

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `✅ Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
          {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            dataSize: response.data ? JSON.stringify(response.data).length : 0,
          },
        )

        if (this.getLoggingConfig().logApiResponses || this.getLoggingConfig().logResponseBodies) {
          this.logger.debug('📥 Cucumber Studio Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          })
        }

        return response
      },
      (error) => {
        if (error.response) {
          const status = error.response.status
          const data = error.response.data as CucumberStudioError

          this.logger.error(`❌ API Error: ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status,
            statusText: error.response.statusText,
            data,
            headers: error.response.headers,
          })

          let message = `API request failed with status ${status}`
          if (data?.errors?.length > 0) {
            message = data.errors.map((e) => e.detail).join('; ')
          }

          throw new CucumberStudioApiError(message, status, data)
        } else if (error.request) {
          this.logger.error('🔌 No Response:', {
            url: error.config?.url,
            timeout: error.code === 'ECONNABORTED',
          })
          throw new CucumberStudioApiError('No response received from Cucumber Studio API')
        } else {
          this.logger.error('⚙️ Request Setup Error:', error.message)
          throw new CucumberStudioApiError(`Request setup failed: ${error.message}`)
        }
      },
    )
  }

  /**
   * Get logging configuration with safe defaults
   */
  private getLoggingConfig() {
    return (
      this.config.logging || {
        level: 'info' as const,
        logApiResponses: false,
        logRequestBodies: false,
        logResponseBodies: false,
      }
    )
  }

  /**
   * Sanitize headers to avoid logging sensitive information
   */
  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    if (!headers) return headers

    const sanitized = { ...headers }
    const sensitiveKeys = ['access-token', 'authorization', 'cookie', 'x-api-key']

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = REDACTED_STRING
      }
    }

    return sanitized
  }

  /**
   * Generic GET request handler
   */
  private async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<CucumberStudioResponse<T>> {
    const response: AxiosResponse<CucumberStudioResponse<T>> = await this.client.get(endpoint, { params })
    return response.data
  }

  // PROJECT ENDPOINTS
  async getProjects(params?: ListParams): Promise<CucumberStudioResponse<Project[]>> {
    return this.get<Project[]>('/projects', params)
  }

  async getProject(projectId: string): Promise<CucumberStudioResponse<Project>> {
    return this.get<Project>(`/projects/${projectId}`)
  }

  // SCENARIO ENDPOINTS
  async getScenarios(projectId: string, params?: ListParams): Promise<CucumberStudioResponse<Scenario[]>> {
    return this.get<Scenario[]>(`/projects/${projectId}/scenarios`, params)
  }

  async getScenario(projectId: string, scenarioId: string): Promise<CucumberStudioResponse<Scenario>> {
    return this.get<Scenario>(`/projects/${projectId}/scenarios/${scenarioId}`)
  }

  async findScenariosByTag(
    projectId: string,
    tags: string,
    params?: ListParams,
  ): Promise<CucumberStudioResponse<Scenario[]>> {
    return this.get<Scenario[]>(`/projects/${projectId}/scenarios/find_by_tags`, {
      ...params,
      'filter[tags]': tags,
    })
  }

  // ACTION WORD ENDPOINTS
  async getActionWords(projectId: string, params?: ListParams): Promise<CucumberStudioResponse<ActionWord[]>> {
    return this.get<ActionWord[]>(`/projects/${projectId}/actionwords`, params)
  }

  async getActionWord(projectId: string, actionWordId: string): Promise<CucumberStudioResponse<ActionWord>> {
    return this.get<ActionWord>(`/projects/${projectId}/actionwords/${actionWordId}`)
  }

  async findActionWordsByTag(
    projectId: string,
    tags: string,
    params?: ListParams,
  ): Promise<CucumberStudioResponse<ActionWord[]>> {
    return this.get<ActionWord[]>(`/projects/${projectId}/actionwords/find_by_tags`, {
      ...params,
      'filter[tags]': tags,
    })
  }

  // FOLDER ENDPOINTS
  async getFolders(projectId: string, params?: ListParams): Promise<CucumberStudioResponse<Folder[]>> {
    return this.get<Folder[]>(`/projects/${projectId}/folders`, params)
  }

  async getFolder(projectId: string, folderId: string): Promise<CucumberStudioResponse<Folder>> {
    return this.get<Folder>(`/projects/${projectId}/folders/${folderId}`)
  }

  async getFolderChildren(
    projectId: string,
    folderId: string,
    params?: ListParams,
  ): Promise<CucumberStudioResponse<Folder[]>> {
    return this.get<Folder[]>(`/projects/${projectId}/folders/${folderId}/children`, params)
  }

  async getFolderScenarios(
    projectId: string,
    folderId: string,
    params?: ListParams,
  ): Promise<CucumberStudioResponse<Scenario[]>> {
    return this.get<Scenario[]>(`/projects/${projectId}/folders/${folderId}/scenarios`, params)
  }

  // TEST RUN ENDPOINTS
  async getTestRuns(projectId: string, params?: ListParams): Promise<CucumberStudioResponse<TestRun[]>> {
    return this.get<TestRun[]>(`/projects/${projectId}/test_runs`, params)
  }

  async getTestRun(projectId: string, testRunId: string): Promise<CucumberStudioResponse<TestRun>> {
    return this.get<TestRun>(`/projects/${projectId}/test_runs/${testRunId}`)
  }

  async getTestExecutions(
    projectId: string,
    testRunId: string,
    params?: ListParams,
  ): Promise<CucumberStudioResponse<TestExecution[]>> {
    return this.get<TestExecution[]>(`/projects/${projectId}/test_runs/${testRunId}/test_executions`, params)
  }

  // BUILD ENDPOINTS
  async getBuilds(projectId: string, params?: ListParams): Promise<CucumberStudioResponse<Build[]>> {
    return this.get<Build[]>(`/projects/${projectId}/builds`, params)
  }

  async getBuild(projectId: string, buildId: string): Promise<CucumberStudioResponse<Build>> {
    return this.get<Build>(`/projects/${projectId}/builds/${buildId}`)
  }

  // EXECUTION ENVIRONMENT ENDPOINTS
  async getExecutionEnvironments(
    projectId: string,
    params?: ListParams,
  ): Promise<CucumberStudioResponse<ExecutionEnvironment[]>> {
    return this.get<ExecutionEnvironment[]>(`/projects/${projectId}/execution_environments`, params)
  }

  /**
   * Test the connection to Cucumber Studio API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getProjects({ 'page[size]': 1 })
      return true
    } catch {
      return false
    }
  }
}
