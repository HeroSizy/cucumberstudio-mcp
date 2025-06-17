export const mockTestRuns = [
  {
    id: 1,
    name: 'Regression Test Suite',
    project_id: 1,
    execution_environment_id: 1,
    status: 'passed',
    statuses: {
      passed: 45,
      failed: 2,
      skipped: 3,
      undefined: 0,
      blocked: 0,
    },
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T11:30:00Z',
  },
  {
    id: 2,
    name: 'Smoke Test',
    project_id: 1,
    execution_environment_id: 2,
    status: 'failed',
    statuses: {
      passed: 20,
      failed: 5,
      skipped: 0,
      undefined: 0,
      blocked: 1,
    },
    created_at: '2024-01-16T14:00:00Z',
    updated_at: '2024-01-16T15:45:00Z',
  },
]

export const mockTestExecutions = [
  {
    id: 1,
    test_run_id: 1,
    scenario_id: 1,
    status: 'passed',
    description: 'User login test execution',
    created_at: '2024-01-15T09:15:00Z',
    updated_at: '2024-01-15T09:45:00Z',
  },
  {
    id: 2,
    test_run_id: 1,
    scenario_id: 2,
    status: 'failed',
    description: 'Product search test execution',
    error_message: 'Search API timeout',
    created_at: '2024-01-15T09:45:00Z',
    updated_at: '2024-01-15T10:15:00Z',
  },
]

export const mockBuilds = [
  {
    id: 1,
    name: 'Release v2.1.0',
    project_id: 1,
    status: 'success',
    test_runs_count: 5,
    scenarios_count: 150,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T12:00:00Z',
  },
  {
    id: 2,
    name: 'Hotfix v2.0.1',
    project_id: 1,
    status: 'failed',
    test_runs_count: 2,
    scenarios_count: 50,
    created_at: '2024-01-14T00:00:00Z',
    updated_at: '2024-01-14T08:30:00Z',
  },
]

export const mockExecutionEnvironments = [
  {
    id: 1,
    name: 'Production',
    project_id: 1,
    description: 'Production environment testing',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Staging',
    project_id: 1,
    description: 'Staging environment for pre-production testing',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

export const mockTestRun = mockTestRuns[0]
export const mockBuild = mockBuilds[0]