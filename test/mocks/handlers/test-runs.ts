import { http, HttpResponse } from 'msw'

import {
  mockTestRuns,
  mockTestRun,
  mockTestExecutions,
  mockBuilds,
  mockBuild,
  mockExecutionEnvironments,
} from '../data/test-runs.js'

const BASE_URL = 'https://api.example.com'

export const testRunHandlers = [
  // List test runs in a project
  http.get(`${BASE_URL}/projects/:projectId/test_runs`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = Number(params.projectId)
    const projectTestRuns = mockTestRuns.filter((t) => t.project_id === projectId)
    
    return HttpResponse.json(projectTestRuns)
  }),

  // Get specific test run
  http.get(`${BASE_URL}/projects/:projectId/test_runs/:id`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testRunId = Number(params.id)
    const testRun = mockTestRuns.find((t) => t.id === testRunId)
    
    if (!testRun) {
      return HttpResponse.json({ error: 'Test run not found' }, { status: 404 })
    }
    
    return HttpResponse.json(testRun)
  }),

  // Get test executions for a test run
  http.get(`${BASE_URL}/projects/:projectId/test_runs/:testRunId/test_snapshots`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const testRunId = Number(params.testRunId)
    const executions = mockTestExecutions.filter((e) => e.test_run_id === testRunId)
    
    return HttpResponse.json(executions)
  }),

  // List builds in a project
  http.get(`${BASE_URL}/projects/:projectId/builds`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = Number(params.projectId)
    const projectBuilds = mockBuilds.filter((b) => b.project_id === projectId)
    
    return HttpResponse.json(projectBuilds)
  }),

  // Get specific build
  http.get(`${BASE_URL}/projects/:projectId/builds/:id`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buildId = Number(params.id)
    const build = mockBuilds.find((b) => b.id === buildId)
    
    if (!build) {
      return HttpResponse.json({ error: 'Build not found' }, { status: 404 })
    }
    
    return HttpResponse.json(build)
  }),

  // List execution environments
  http.get(`${BASE_URL}/projects/:projectId/execution_environments`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = Number(params.projectId)
    const environments = mockExecutionEnvironments.filter((e) => e.project_id === projectId)
    
    return HttpResponse.json(environments)
  }),
]