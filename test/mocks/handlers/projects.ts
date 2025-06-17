import { http, HttpResponse } from 'msw'

import { mockProjects, mockProject } from '../data/projects.js'

const BASE_URL = 'https://api.example.com'

export const projectHandlers = [
  // List all projects
  http.get(`${BASE_URL}/projects`, ({ request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return HttpResponse.json(mockProjects)
  }),

  // Get specific project
  http.get(`${BASE_URL}/projects/:id`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = String(params.id)
    const project = mockProjects.data.find((p: any) => p.id === projectId)
    
    if (!project) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    return HttpResponse.json({ data: project })
  }),

  // Error scenarios for testing
  http.get(`${BASE_URL}/projects/999`, () => {
    return HttpResponse.json({ error: 'Project not found' }, { status: 404 })
  }),

  http.get(`${BASE_URL}/projects/error`, () => {
    return HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
  }),
]