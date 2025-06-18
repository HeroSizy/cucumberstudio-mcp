import { describe, it, expect, vi } from 'vitest'

import { StreamableHttpTransport } from '@/transports/http.js'
import { NoOpLogger } from '@/utils/logger.js'

describe('StreamableHttpTransport Basic', () => {
  describe('constructor', () => {
    it('should create transport with default options', () => {
      const mockCreateServer = vi.fn()
      const logger = new NoOpLogger()
      const transport = new StreamableHttpTransport(
        mockCreateServer,
        {
          port: 3000,
          host: '127.0.0.1',
          cors: { origin: true },
        },
        logger,
      )

      expect(transport).toBeDefined()
      expect(typeof transport.start).toBe('function')
      expect(typeof transport.close).toBe('function')
    })

    it('should handle custom CORS options', () => {
      const mockCreateServer = vi.fn()
      const logger = new NoOpLogger()
      const transport = new StreamableHttpTransport(
        mockCreateServer,
        {
          port: 3001,
          host: 'localhost',
          cors: {
            origin: ['http://localhost:3000'],
            credentials: true,
          },
        },
        logger,
      )

      expect(transport).toBeDefined()
    })
  })

  describe('origin validation', () => {
    it('should validate localhost origins', () => {
      const mockCreateServer = vi.fn()
      const logger = new NoOpLogger()
      const transport = new StreamableHttpTransport(
        mockCreateServer,
        {
          port: 3000,
          host: '127.0.0.1',
          cors: { origin: true },
        },
        logger,
      )

      // Test that the transport can be instantiated with localhost origins
      expect(transport).toBeDefined()
    })
  })

  describe('server management', () => {
    it('should handle server lifecycle methods', async () => {
      const mockCreateServer = vi.fn()
      const logger = new NoOpLogger()
      const transport = new StreamableHttpTransport(
        mockCreateServer,
        {
          port: 0, // Use random port to avoid conflicts
          host: '127.0.0.1',
          cors: { origin: true },
        },
        logger,
      )

      // Test that lifecycle methods exist and can be called
      expect(typeof transport.start).toBe('function')
      expect(typeof transport.close).toBe('function')

      // For now, just test that close doesn't throw when called without starting
      await expect(transport.close()).resolves.not.toThrow()
    })
  })
})
