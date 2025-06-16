import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { CucumberStudioApiClient, CucumberStudioApiError } from './client.js';
import type { Config } from '../config/settings.js';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('CucumberStudioApiClient', () => {
  let config: Config;
  let client: CucumberStudioApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    config = {
      cucumberStudio: {
        baseUrl: 'https://api.example.com',
        accessToken: 'test-token',
        clientId: 'test-client',
        uid: 'test-uid',
      },
      server: {
        name: 'test-server',
        version: '1.0.0',
        transport: 'stdio' as const,
        port: 3000,
        host: '127.0.0.1',
      },
    };

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    client = new CucumberStudioApiClient(config);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        headers: {
          'Accept': 'application/vnd.api+json; version=1',
          'Content-Type': 'application/json',
          'access-token': 'test-token',
          'client': 'test-client',
          'uid': 'test-uid',
        },
        timeout: 30000,
      });
    });

    it('should set up response interceptor', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('API methods', () => {
    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue({ data: { data: [] } });
    });

    describe('getProjects', () => {
      it('should call correct endpoint', async () => {
        await client.getProjects();
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects', { params: undefined });
      });

      it('should pass parameters correctly', async () => {
        const params = { 'page[number]': 1, 'page[size]': 10 };
        await client.getProjects(params);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects', { params });
      });
    });

    describe('getProject', () => {
      it('should call correct endpoint with project ID', async () => {
        await client.getProject('123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123', { params: undefined });
      });
    });

    describe('getScenarios', () => {
      it('should call correct endpoint with project ID', async () => {
        await client.getScenarios('123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/scenarios', { params: undefined });
      });

      it('should pass parameters correctly', async () => {
        const params = { 'filter[name]': 'test' };
        await client.getScenarios('123', params);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/scenarios', { params });
      });
    });

    describe('getScenario', () => {
      it('should call correct endpoint with project and scenario IDs', async () => {
        await client.getScenario('123', '456');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/scenarios/456', { params: undefined });
      });
    });

    describe('findScenariosByTag', () => {
      it('should call correct endpoint with tags parameter', async () => {
        await client.findScenariosByTag('123', 'smoke,regression');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/scenarios/find_by_tags', {
          params: { 'filter[tags]': 'smoke,regression' }
        });
      });

      it('should merge additional parameters', async () => {
        const params = { 'page[number]': 2 };
        await client.findScenariosByTag('123', 'api', params);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/scenarios/find_by_tags', {
          params: { ...params, 'filter[tags]': 'api' }
        });
      });
    });

    describe('getActionWords', () => {
      it('should call correct endpoint', async () => {
        await client.getActionWords('123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/actionwords', { params: undefined });
      });
    });

    describe('getActionWord', () => {
      it('should call correct endpoint with IDs', async () => {
        await client.getActionWord('123', '789');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/actionwords/789', { params: undefined });
      });
    });

    describe('findActionWordsByTag', () => {
      it('should call correct endpoint with tags', async () => {
        await client.findActionWordsByTag('123', 'utils');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/actionwords/find_by_tags', {
          params: { 'filter[tags]': 'utils' }
        });
      });
    });

    describe('getFolders', () => {
      it('should call correct endpoint', async () => {
        await client.getFolders('123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/folders', { params: undefined });
      });
    });

    describe('getFolder', () => {
      it('should call correct endpoint with folder ID', async () => {
        await client.getFolder('123', 'folder-456');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/folders/folder-456', { params: undefined });
      });
    });

    describe('getFolderChildren', () => {
      it('should call correct endpoint for folder children', async () => {
        await client.getFolderChildren('123', 'folder-456');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/folders/folder-456/children', { params: undefined });
      });
    });

    describe('getFolderScenarios', () => {
      it('should call correct endpoint for folder scenarios', async () => {
        await client.getFolderScenarios('123', 'folder-456');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/folders/folder-456/scenarios', { params: undefined });
      });
    });

    describe('getTestRuns', () => {
      it('should call correct endpoint', async () => {
        await client.getTestRuns('123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/test_runs', { params: undefined });
      });
    });

    describe('getTestRun', () => {
      it('should call correct endpoint with test run ID', async () => {
        await client.getTestRun('123', 'run-789');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/test_runs/run-789', { params: undefined });
      });
    });

    describe('getTestExecutions', () => {
      it('should call correct endpoint for test executions', async () => {
        await client.getTestExecutions('123', 'run-789');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/test_runs/run-789/test_executions', { params: undefined });
      });
    });

    describe('getBuilds', () => {
      it('should call correct endpoint', async () => {
        await client.getBuilds('123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/builds', { params: undefined });
      });
    });

    describe('getBuild', () => {
      it('should call correct endpoint with build ID', async () => {
        await client.getBuild('123', 'build-456');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/builds/build-456', { params: undefined });
      });
    });

    describe('getExecutionEnvironments', () => {
      it('should call correct endpoint', async () => {
        await client.getExecutionEnvironments('123');
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects/123/execution_environments', { params: undefined });
      });
    });
  });

  describe('testConnection', () => {
    it('should return true when API call succeeds', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { data: [] } });

      const result = await client.testConnection();

      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/projects', { params: { 'page[size]': 1 } });
    });

    it('should return false when API call fails', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw CucumberStudioApiError for response errors', async () => {
      const responseError = {
        response: {
          status: 400,
          data: {
            errors: [{ detail: 'Invalid request', title: 'Bad Request' }]
          }
        }
      };

      // Trigger the error interceptor
      const interceptorCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      expect(() => interceptorCallback(responseError)).toThrow(CucumberStudioApiError);
    });

    it('should handle network errors', async () => {
      const networkError = {
        request: {},
        message: 'Network error'
      };

      const interceptorCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      expect(() => interceptorCallback(networkError)).toThrow(CucumberStudioApiError);
    });

    it('should handle request setup errors', async () => {
      const setupError = {
        message: 'Request setup failed'
      };

      const interceptorCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      expect(() => interceptorCallback(setupError)).toThrow(CucumberStudioApiError);
    });
  });

  describe('CucumberStudioApiError', () => {
    it('should create error with message only', () => {
      const error = new CucumberStudioApiError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('CucumberStudioApiError');
      expect(error.status).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with status and details', () => {
      const details = { errors: [{ detail: 'Invalid', title: 'Error' }] };
      const error = new CucumberStudioApiError('API error', 400, details);
      
      expect(error.message).toBe('API error');
      expect(error.status).toBe(400);
      expect(error.details).toBe(details);
    });
  });
});