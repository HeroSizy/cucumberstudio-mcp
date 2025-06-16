import { describe, it, expect, beforeEach } from 'vitest'
import { CucumberStudioApiClient } from '@/api/client.js'
import type { Config } from '@/config/settings.js'
import { mockProjects, mockProject } from '../mocks/data/index.js'

describe('CucumberStudioApiClient with MSW', () => {
  let config: Config
  let client: CucumberStudioApiClient

  beforeEach(() => {
    config = {
      cucumberStudio: {
        baseUrl: 'https://api.example.com',
        accessToken: 'token', // Valid token for MSW
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
    }

    client = new CucumberStudioApiClient(config)
  })

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const result = await client.testConnection()
      expect(result).toBe(true)
    })

    it('should return false for unauthorized connection', async () => {
      const unauthorizedConfig = {
        ...config,
        cucumberStudio: {
          ...config.cucumberStudio,
          accessToken: 'invalid-token',
        },
      }
      const unauthorizedClient = new CucumberStudioApiClient(unauthorizedConfig)

      const result = await unauthorizedClient.testConnection()
      expect(result).toBe(false)
    })
  })

  describe('getProjects', () => {
    it('should fetch all projects', async () => {
      const projects = await client.getProjects()
      
      expect(projects).toEqual(mockProjects)
      expect(projects).toHaveLength(3)
      expect(projects[0].name).toBe('E-commerce Platform')
    })
  })

  describe('getProject', () => {
    it('should fetch a specific project', async () => {
      const project = await client.getProject(1)
      
      expect(project).toEqual(mockProject)
      expect(project.id).toBe(1)
      expect(project.name).toBe('E-commerce Platform')
    })

    it('should throw error for non-existent project', async () => {
      await expect(client.getProject(999)).rejects.toThrow()
    })
  })
})