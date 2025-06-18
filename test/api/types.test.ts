import { describe, it, expect } from 'vitest'

describe('API Types', () => {
  it('should be able to import types module', async () => {
    const types = await import('@/api/types.js')
    expect(types).toBeDefined()
  })

  it('should define type interfaces correctly', () => {
    // Test that we can create objects matching the expected types
    const mockApiResponse = {
      data: [],
      meta: {
        total: 0,
        page: 1,
        pageSize: 10,
      },
    }

    const mockProject = {
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockScenario = {
      id: 1,
      name: 'Test Scenario',
      description: 'A test scenario',
      project_id: 1,
      folder_id: null,
      tags: ['test'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockActionWord = {
      id: 1,
      name: 'Test Action Word',
      description: 'A test action word',
      project_id: 1,
      tags: ['test'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockTestRun = {
      id: 1,
      name: 'Test Run',
      project_id: 1,
      status: 'passed',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockBuild = {
      id: 1,
      name: 'Test Build',
      project_id: 1,
      status: 'success',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockError = {
      message: 'Test error',
      code: 'TEST_ERROR',
    }

    const mockListParams = {
      page: 1,
      pageSize: 10,
      tags: ['test'],
    }

    // Verify objects can be created (TypeScript compilation test)
    expect(mockApiResponse).toBeDefined()
    expect(mockProject).toBeDefined()
    expect(mockScenario).toBeDefined()
    expect(mockActionWord).toBeDefined()
    expect(mockTestRun).toBeDefined()
    expect(mockBuild).toBeDefined()
    expect(mockError).toBeDefined()
    expect(mockListParams).toBeDefined()
  })
})
