import { http, HttpResponse } from 'msw'
import { mockScenarios, mockScenario, mockFolders } from '../data/scenarios.js'

const BASE_URL = 'https://api.example.com'

export const scenarioHandlers = [
  // List scenarios in a project
  http.get(`${BASE_URL}/projects/:projectId/scenarios`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = Number(params.projectId)
    const projectScenarios = mockScenarios.filter((s) => s.project_id === projectId)
    
    // Handle query parameters for filtering
    const url = new URL(request.url)
    const tags = url.searchParams.get('tags')
    const folderId = url.searchParams.get('folder_id')
    
    let filteredScenarios = projectScenarios
    
    if (tags) {
      const tagList = tags.split(',')
      filteredScenarios = filteredScenarios.filter((scenario) =>
        tagList.some((tag) => scenario.tags.includes(tag.trim()))
      )
    }
    
    if (folderId) {
      const folderIdNum = Number(folderId)
      filteredScenarios = filteredScenarios.filter((scenario) => scenario.folder_id === folderIdNum)
    }
    
    return HttpResponse.json(filteredScenarios)
  }),

  // Get specific scenario
  http.get(`${BASE_URL}/projects/:projectId/scenarios/:id`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scenarioId = Number(params.id)
    const scenario = mockScenarios.find((s) => s.id === scenarioId)
    
    if (!scenario) {
      return HttpResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }
    
    return HttpResponse.json(scenario)
  }),

  // List folders in a project
  http.get(`${BASE_URL}/projects/:projectId/folders`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = Number(params.projectId)
    const projectFolders = mockFolders.filter((f) => f.project_id === projectId)
    
    return HttpResponse.json(projectFolders)
  }),
]