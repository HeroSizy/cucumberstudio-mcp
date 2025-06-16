import { http, HttpResponse } from 'msw'
import { mockActionWords, mockActionWord } from '../data/action-words.js'

const BASE_URL = 'https://api.example.com'

export const actionWordHandlers = [
  // List action words in a project
  http.get(`${BASE_URL}/projects/:projectId/actionwords`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = Number(params.projectId)
    const projectActionWords = mockActionWords.filter((a) => a.project_id === projectId)
    
    // Handle query parameters for filtering
    const url = new URL(request.url)
    const tags = url.searchParams.get('tags')
    
    let filteredActionWords = projectActionWords
    
    if (tags) {
      const tagList = tags.split(',')
      filteredActionWords = filteredActionWords.filter((actionWord) =>
        tagList.some((tag) => actionWord.tags.includes(tag.trim()))
      )
    }
    
    return HttpResponse.json(filteredActionWords)
  }),

  // Get specific action word
  http.get(`${BASE_URL}/projects/:projectId/actionwords/:id`, ({ params, request }) => {
    const accessToken = request.headers.get('access-token')
    
    if (!accessToken || accessToken !== 'token') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const actionWordId = Number(params.id)
    const actionWord = mockActionWords.find((a) => a.id === actionWordId)
    
    if (!actionWord) {
      return HttpResponse.json({ error: 'Action word not found' }, { status: 404 })
    }
    
    return HttpResponse.json(actionWord)
  }),
]