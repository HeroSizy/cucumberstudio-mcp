// Common API response structure for Cucumber Studio
export interface CucumberStudioResponse<T = unknown> {
  data: T
  included?: Record<string, unknown>[]
  meta?: {
    count?: number
    total_count?: number
  }
}

// Base attributes common to many resources
export interface BaseAttributes {
  id: string
  type: string
  attributes: Record<string, unknown>
  relationships?: Record<string, unknown>
}

// Project related types
export interface Project extends BaseAttributes {
  type: 'projects'
  attributes: {
    name: string
    description?: string
    created_at: string
    updated_at: string
  }
}

// Scenario related types
export interface Scenario extends BaseAttributes {
  type: 'scenarios'
  attributes: {
    name: string
    description?: string
    definition?: string
    created_at: string
    updated_at: string
    folder_id?: string
  }
}

// Action Word related types
export interface ActionWord extends BaseAttributes {
  type: 'actionwords'
  attributes: {
    name: string
    description?: string
    definition?: string
    created_at: string
    updated_at: string
  }
}

// Folder related types
export interface Folder extends BaseAttributes {
  type: 'folders'
  attributes: {
    name: string
    description?: string
    created_at: string
    updated_at: string
    parent_id?: string
  }
}

// Test Run related types
export interface TestRun extends BaseAttributes {
  type: 'test_runs'
  attributes: {
    name: string
    description?: string
    created_at: string
    updated_at: string
    execution_environment?: string
  }
}

// Test Execution related types
export interface TestExecution extends BaseAttributes {
  type: 'test_executions'
  attributes: {
    status: 'passed' | 'failed' | 'wip' | 'retest' | 'blocked' | 'skipped' | 'undefined'
    created_at: string
    updated_at: string
    scenario_id: string
    test_run_id: string
  }
}

// Build related types
export interface Build extends BaseAttributes {
  type: 'builds'
  attributes: {
    name: string
    description?: string
    created_at: string
    updated_at: string
  }
}

// Execution Environment related types
export interface ExecutionEnvironment extends BaseAttributes {
  type: 'execution_environments'
  attributes: {
    name: string
    description?: string
    created_at: string
    updated_at: string
  }
}

// Tag related types
export interface Tag extends BaseAttributes {
  type: 'tags'
  attributes: {
    key: string
    value?: string
  }
}

// API Error structure
export interface CucumberStudioError {
  errors: Array<{
    detail: string
    status: string
    title: string
  }>
}

// Query parameters for list endpoints
export interface ListParams extends Record<string, unknown> {
  'page[number]'?: number
  'page[size]'?: number
  'filter[name]'?: string
  'filter[tags]'?: string
}
