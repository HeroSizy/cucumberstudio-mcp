import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CallToolRequest, TextContent } from '@modelcontextprotocol/sdk/types.js';
import { ProjectTools } from './projects.js';
import { CucumberStudioApiClient } from '../api/client.js';

// Mock the API client
vi.mock('../api/client.js');

describe('ProjectTools', () => {
  let mockApiClient: any;
  let projectTools: ProjectTools;

  beforeEach(() => {
    mockApiClient = {
      getProjects: vi.fn(),
      getProject: vi.fn(),
    };

    projectTools = new ProjectTools(mockApiClient as any);
  });

  describe('getTools', () => {
    it('should return array of available tools', () => {
      const tools = projectTools.getTools();

      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('cucumberstudio_list_projects');
      expect(tools[1].name).toBe('cucumberstudio_get_project');
    });

    it('should include proper tool schemas', () => {
      const tools = projectTools.getTools();
      
      const listTool = tools.find(t => t.name === 'cucumberstudio_list_projects');
      expect(listTool?.description).toContain('List all projects');
      expect(listTool?.inputSchema.type).toBe('object');
      expect(listTool?.inputSchema.additionalProperties).toBe(false);

      const getTool = tools.find(t => t.name === 'cucumberstudio_get_project');
      expect(getTool?.description).toContain('Get detailed information');
      expect(getTool?.inputSchema.required).toContain('projectId');
    });
  });

  describe('handleToolCall', () => {
    describe('cucumberstudio_list_projects', () => {
      it('should handle list projects request without parameters', async () => {
        const mockResponse = {
          data: [
            {
              id: '1',
              attributes: {
                name: 'Test Project',
                description: 'A test project',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z',
              },
            },
          ],
          meta: { total_count: 1 },
        };

        mockApiClient.getProjects.mockResolvedValue(mockResponse);

        const request: CallToolRequest = {
          method: 'tools/call',
          params: {
            name: 'cucumberstudio_list_projects',
            arguments: {},
          },
        };

        const result = await projectTools.handleToolCall(request);

        expect(mockApiClient.getProjects).toHaveBeenCalledWith({});
        expect(result.content).toHaveLength(1);
        
        const content = result.content[0] as TextContent;
        const responseData = JSON.parse(content.text);
        
        expect(responseData.projects).toHaveLength(1);
        expect(responseData.projects[0]).toEqual({
          id: '1',
          name: 'Test Project',
          description: 'A test project',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
        });
        expect(responseData.meta).toEqual({ total_count: 1 });
      });

      it('should handle list projects request with pagination', async () => {
        const mockResponse = {
          data: [],
          meta: { total_count: 0 },
        };

        mockApiClient.getProjects.mockResolvedValue(mockResponse);

        const request: CallToolRequest = {
          method: 'tools/call',
          params: {
            name: 'cucumberstudio_list_projects',
            arguments: {
              pagination: { page: 2, pageSize: 10 },
              filter: { name: 'test' },
            },
          },
        };

        await projectTools.handleToolCall(request);

        expect(mockApiClient.getProjects).toHaveBeenCalledWith({
          'page[number]': 2,
          'page[size]': 10,
          'filter[name]': 'test',
        });
      });

      it('should handle single project data format', async () => {
        const mockResponse = {
          data: {
            id: '1',
            attributes: {
              name: 'Single Project',
              description: 'Single project response',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-02T00:00:00Z',
            },
          },
        };

        mockApiClient.getProjects.mockResolvedValue(mockResponse);

        const request: CallToolRequest = {
          method: 'tools/call',
          params: {
            name: 'cucumberstudio_list_projects',
            arguments: {},
          },
        };

        const result = await projectTools.handleToolCall(request);
        const content = result.content[0] as TextContent;
        const responseData = JSON.parse(content.text);

        expect(responseData.projects).toHaveLength(1);
        expect(responseData.projects[0].name).toBe('Single Project');
      });
    });

    describe('cucumberstudio_get_project', () => {
      it('should handle get project request', async () => {
        const mockResponse = {
          data: {
            id: '123',
            type: 'projects',
            attributes: {
              name: 'Specific Project',
              description: 'Project details',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-02T00:00:00Z',
            },
            relationships: {
              scenarios: { data: [] },
            },
          },
          included: [],
        };

        mockApiClient.getProject.mockResolvedValue(mockResponse);

        const request: CallToolRequest = {
          method: 'tools/call',
          params: {
            name: 'cucumberstudio_get_project',
            arguments: { projectId: '123' },
          },
        };

        const result = await projectTools.handleToolCall(request);

        expect(mockApiClient.getProject).toHaveBeenCalledWith('123');
        
        const content = result.content[0] as TextContent;
        const responseData = JSON.parse(content.text);
        
        expect(responseData.project).toEqual({
          id: '123',
          type: 'projects',
          name: 'Specific Project',
          description: 'Project details',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
          relationships: { scenarios: { data: [] } },
        });
        expect(responseData.included).toEqual([]);
      });

      it('should validate required projectId parameter', async () => {
        const request: CallToolRequest = {
          method: 'tools/call',
          params: {
            name: 'cucumberstudio_get_project',
            arguments: {},
          },
        };

        await expect(projectTools.handleToolCall(request)).rejects.toThrow();
      });

      it('should validate empty projectId', async () => {
        const request: CallToolRequest = {
          method: 'tools/call',
          params: {
            name: 'cucumberstudio_get_project',
            arguments: { projectId: '' },
          },
        };

        await expect(projectTools.handleToolCall(request)).rejects.toThrow();
      });
    });

    it('should throw error for unknown tool', async () => {
      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'unknown_tool',
          arguments: {},
        },
      };

      await expect(projectTools.handleToolCall(request)).rejects.toThrow('Unknown tool: unknown_tool');
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.getProjects.mockRejectedValue(new Error('API Error'));

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_list_projects',
          arguments: {},
        },
      };

      await expect(projectTools.handleToolCall(request)).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle missing project attributes', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            // Missing attributes
          },
        ],
      };

      mockApiClient.getProjects.mockResolvedValue(mockResponse);

      const request: CallToolRequest = {
        method: 'tools/call',
        params: {
          name: 'cucumberstudio_list_projects',
          arguments: {},
        },
      };

      const result = await projectTools.handleToolCall(request);
      const content = result.content[0] as TextContent;
      const responseData = JSON.parse(content.text);

      expect(responseData.projects[0]).toEqual({
        id: '1',
        name: 'Unknown',
        description: '',
        created_at: undefined,
        updated_at: undefined,
      });
    });
  });
});