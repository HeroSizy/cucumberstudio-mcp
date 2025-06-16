import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StdioTransport } from '../../src/transports/stdio.js'

// Mock the SDK components
vi.mock('@modelcontextprotocol/sdk/server/index.js')
vi.mock('@modelcontextprotocol/sdk/server/stdio.js')

describe('StdioTransport', () => {
  let mockServer: any
  let mockStdioTransport: any
  let transport: StdioTransport

  beforeEach(() => {
    mockServer = {
      connect: vi.fn(),
    }

    mockStdioTransport = {
      close: vi.fn(),
    }

    vi.mocked(StdioServerTransport).mockImplementation(() => mockStdioTransport)

    transport = new StdioTransport(mockServer)
  })

  describe('constructor', () => {
    it('should create StdioServerTransport instance', () => {
      expect(StdioServerTransport).toHaveBeenCalled()
    })

    it('should store server reference', () => {
      expect(transport).toBeDefined()
    })
  })

  describe('start', () => {
    it('should connect server to transport', async () => {
      mockServer.connect.mockResolvedValue(undefined)

      await transport.start()

      expect(mockServer.connect).toHaveBeenCalledWith(mockStdioTransport)
    })

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed')
      mockServer.connect.mockRejectedValue(error)

      await expect(transport.start()).rejects.toThrow('Connection failed')
    })
  })

  describe('close', () => {
    it('should close the transport', async () => {
      mockStdioTransport.close.mockResolvedValue(undefined)

      await transport.close()

      expect(mockStdioTransport.close).toHaveBeenCalled()
    })

    it('should handle close errors gracefully', async () => {
      const error = new Error('Close failed')
      mockStdioTransport.close.mockRejectedValue(error)

      await expect(transport.close()).rejects.toThrow('Close failed')
    })
  })
})
