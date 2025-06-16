import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { Config } from '../config/settings.js'
import { CucumberStudioResponse, CucumberStudioError, ListParams } from './types.js'

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

  constructor(private config: Config) {
    this.client = axios.create({
      baseURL: config.cucumberStudio.baseUrl,
      headers: {
        Accept: 'application/vnd.api+json; version=1',
        'Content-Type': 'application/json',
        'access-token': config.cucumberStudio.accessToken,
        client: config.cucumberStudio.clientId,
        uid: config.cucumberStudio.uid,
      },
      timeout: 30000, // 30 second timeout
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status
          const data = error.response.data as CucumberStudioError

          let message = `API request failed with status ${status}`
          if (data?.errors?.length > 0) {
            message = data.errors.map((e) => e.detail).join('; ')
          }

          throw new CucumberStudioApiError(message, status, data)
        } else if (error.request) {
          throw new CucumberStudioApiError('No response received from Cucumber Studio API')
        } else {
          throw new CucumberStudioApiError(`Request setup failed: ${error.message}`)
        }
      },
    )
  }

  /**
   * Generic GET request handler
   */
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<CucumberStudioResponse<T>> {
    const response: AxiosResponse<CucumberStudioResponse<T>> = await this.client.get(endpoint, { params })
    return response.data
  }

  // PROJECT ENDPOINTS
  async getProjects(params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get('/projects', params)
  }

  async getProject(projectId: string): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}`)
  }

  // SCENARIO ENDPOINTS
  async getScenarios(projectId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/scenarios`, params)
  }

  async getScenario(projectId: string, scenarioId: string): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/scenarios/${scenarioId}`)
  }

  async findScenariosByTag(projectId: string, tags: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/scenarios/find_by_tags`, {
      ...params,
      'filter[tags]': tags,
    })
  }

  // ACTION WORD ENDPOINTS
  async getActionWords(projectId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/actionwords`, params)
  }

  async getActionWord(projectId: string, actionWordId: string): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/actionwords/${actionWordId}`)
  }

  async findActionWordsByTag(projectId: string, tags: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/actionwords/find_by_tags`, {
      ...params,
      'filter[tags]': tags,
    })
  }

  // FOLDER ENDPOINTS
  async getFolders(projectId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/folders`, params)
  }

  async getFolder(projectId: string, folderId: string): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/folders/${folderId}`)
  }

  async getFolderChildren(projectId: string, folderId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/folders/${folderId}/children`, params)
  }

  async getFolderScenarios(projectId: string, folderId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/folders/${folderId}/scenarios`, params)
  }

  // TEST RUN ENDPOINTS
  async getTestRuns(projectId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/test_runs`, params)
  }

  async getTestRun(projectId: string, testRunId: string): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/test_runs/${testRunId}`)
  }

  async getTestExecutions(projectId: string, testRunId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/test_runs/${testRunId}/test_executions`, params)
  }

  // BUILD ENDPOINTS
  async getBuilds(projectId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/builds`, params)
  }

  async getBuild(projectId: string, buildId: string): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/builds/${buildId}`)
  }

  // EXECUTION ENVIRONMENT ENDPOINTS
  async getExecutionEnvironments(projectId: string, params?: ListParams): Promise<CucumberStudioResponse> {
    return this.get(`/projects/${projectId}/execution_environments`, params)
  }

  /**
   * Test the connection to Cucumber Studio API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getProjects({ 'page[size]': 1 })
      return true
    } catch (error) {
      return false
    }
  }
}
