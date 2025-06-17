import { describe, it, expect, beforeEach } from 'vitest'

import { CucumberStudioApiClient } from '@/api/client.js'
import type { Config } from '@/config/settings.js'
import { NoOpLogger } from '@/utils/logger.js'

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
      logging: {
        level: 'info' as const,
        logApiResponses: false,
        logRequestBodies: false,
        logResponseBodies: false,
        transport: 'stderr' as const,
      },
    }

    const logger = new NoOpLogger()
    client = new CucumberStudioApiClient(config, logger)
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
      const logger = new NoOpLogger()
      const unauthorizedClient = new CucumberStudioApiClient(unauthorizedConfig, logger)

      const result = await unauthorizedClient.testConnection()
      expect(result).toBe(false)
    })
  })

  describe('getProjects', () => {
    it('should fetch all projects', async () => {
      const response = await client.getProjects()
      
      expect(response.data).toEqual(mockProjects.data)
      expect(response.data).toHaveLength(3)
      expect(response.data[0].attributes.name).toBe('E-commerce Platform')
    })
  })

  describe('getProject', () => {
    it('should fetch a specific project', async () => {
      const response = await client.getProject('1')
      
      expect(response.data).toEqual(mockProject.data)
      expect(response.data.id).toBe('1')
      expect(response.data.attributes.name).toBe('E-commerce Platform')
    })

    it('should throw error for non-existent project', async () => {
      await expect(client.getProject('999')).rejects.toThrow()
    })
  })
})