import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js'
import {
  ProjectIdSchema,
  ScenarioIdSchema,
  ActionWordIdSchema,
  FolderIdSchema,
  TestRunIdSchema,
  BuildIdSchema,
  PaginationSchema,
  FilterSchema,
  ListParamsSchema,
  convertToApiParams,
  validateInput,
  validateEnvironment,
} from '../../src/utils/validation.js'

describe('validation utilities', () => {
  describe('schemas', () => {
    it('should validate project ID', () => {
      expect(ProjectIdSchema.parse('project-123')).toBe('project-123')
      expect(() => ProjectIdSchema.parse('')).toThrow()
      expect(() => ProjectIdSchema.parse(null)).toThrow()
    })

    it('should validate scenario ID', () => {
      expect(ScenarioIdSchema.parse('scenario-456')).toBe('scenario-456')
      expect(() => ScenarioIdSchema.parse('')).toThrow()
    })

    it('should validate action word ID', () => {
      expect(ActionWordIdSchema.parse('action-789')).toBe('action-789')
      expect(() => ActionWordIdSchema.parse('')).toThrow()
    })

    it('should validate folder ID', () => {
      expect(FolderIdSchema.parse('folder-101')).toBe('folder-101')
      expect(() => FolderIdSchema.parse('')).toThrow()
    })

    it('should validate test run ID', () => {
      expect(TestRunIdSchema.parse('testrun-202')).toBe('testrun-202')
      expect(() => TestRunIdSchema.parse('')).toThrow()
    })

    it('should validate build ID', () => {
      expect(BuildIdSchema.parse('build-303')).toBe('build-303')
      expect(() => BuildIdSchema.parse('')).toThrow()
    })

    it('should validate pagination schema', () => {
      expect(PaginationSchema.parse({ page: 1, pageSize: 10 })).toEqual({ page: 1, pageSize: 10 })
      expect(PaginationSchema.parse({})).toEqual({})
      expect(PaginationSchema.parse(undefined)).toBeUndefined()
      expect(() => PaginationSchema.parse({ page: 0 })).toThrow()
      expect(() => PaginationSchema.parse({ pageSize: 101 })).toThrow()
    })

    it('should validate filter schema', () => {
      expect(FilterSchema.parse({ name: 'test', tags: 'tag1,tag2' })).toEqual({ name: 'test', tags: 'tag1,tag2' })
      expect(FilterSchema.parse({})).toEqual({})
      expect(FilterSchema.parse(undefined)).toBeUndefined()
    })

    it('should validate list params schema', () => {
      const validParams = {
        pagination: { page: 1, pageSize: 20 },
        filter: { name: 'test' },
      }
      expect(ListParamsSchema.parse(validParams)).toEqual(validParams)
      expect(ListParamsSchema.parse({})).toEqual({})
      expect(ListParamsSchema.parse(undefined)).toBeUndefined()
    })
  })

  describe('convertToApiParams', () => {
    it('should convert pagination parameters', () => {
      const params = {
        pagination: { page: 2, pageSize: 25 },
      }

      const result = convertToApiParams(params)

      expect(result).toEqual({
        'page[number]': 2,
        'page[size]': 25,
      })
    })

    it('should convert filter parameters', () => {
      const params = {
        filter: { name: 'test-scenario', tags: 'smoke,regression' },
      }

      const result = convertToApiParams(params)

      expect(result).toEqual({
        'filter[name]': 'test-scenario',
        'filter[tags]': 'smoke,regression',
      })
    })

    it('should convert combined parameters', () => {
      const params = {
        pagination: { page: 3, pageSize: 50 },
        filter: { name: 'api-test', tags: 'api' },
      }

      const result = convertToApiParams(params)

      expect(result).toEqual({
        'page[number]': 3,
        'page[size]': 50,
        'filter[name]': 'api-test',
        'filter[tags]': 'api',
      })
    })

    it('should handle undefined parameters', () => {
      const result = convertToApiParams()
      expect(result).toEqual({})
    })

    it('should handle empty parameters', () => {
      const result = convertToApiParams({})
      expect(result).toEqual({})
    })

    it('should handle partial parameters', () => {
      const params = {
        pagination: { page: 1 },
        filter: { tags: 'integration' },
      }

      const result = convertToApiParams(params)

      expect(result).toEqual({
        'page[number]': 1,
        'filter[tags]': 'integration',
      })
    })
  })

  describe('validateInput', () => {
    it('should return parsed input for valid data', () => {
      const result = validateInput(ProjectIdSchema, 'valid-project-id')
      expect(result).toBe('valid-project-id')
    })

    it('should throw McpError for invalid data', () => {
      expect(() => validateInput(ProjectIdSchema, '')).toThrow(McpError)
      expect(() => validateInput(ProjectIdSchema, null)).toThrow(McpError)
    })

    it('should include context in error message', () => {
      try {
        validateInput(ProjectIdSchema, '', 'test operation')
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        expect((error as McpError).code).toBe(ErrorCode.InvalidParams)
        expect((error as McpError).message).toContain('test operation')
      }
    })

    it('should handle complex schema validation', () => {
      const complexInput = {
        pagination: { page: 1, pageSize: 10 },
        filter: { name: 'test' },
      }

      const result = validateInput(ListParamsSchema, complexInput)
      expect(result).toEqual(complexInput)
    })

    it('should provide detailed error messages for schema violations', () => {
      try {
        validateInput(PaginationSchema, { page: 0, pageSize: 101 })
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.message).toContain('page')
        expect(mcpError.message).toContain('pageSize')
      }
    })
  })

  describe('validateEnvironment', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should pass when all required environment variables are present', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      expect(() => validateEnvironment()).not.toThrow()
    })

    it('should throw McpError when access token is missing', () => {
      delete process.env.CUCUMBERSTUDIO_ACCESS_TOKEN
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client'
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      expect(() => validateEnvironment()).toThrow(McpError)
      expect(() => validateEnvironment()).toThrow(/CUCUMBERSTUDIO_ACCESS_TOKEN/)
    })

    it('should throw McpError when client ID is missing', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      delete process.env.CUCUMBERSTUDIO_CLIENT_ID
      process.env.CUCUMBERSTUDIO_UID = 'test-uid'

      expect(() => validateEnvironment()).toThrow(McpError)
      expect(() => validateEnvironment()).toThrow(/CUCUMBERSTUDIO_CLIENT_ID/)
    })

    it('should throw McpError when UID is missing', () => {
      process.env.CUCUMBERSTUDIO_ACCESS_TOKEN = 'test-token'
      process.env.CUCUMBERSTUDIO_CLIENT_ID = 'test-client'
      delete process.env.CUCUMBERSTUDIO_UID

      expect(() => validateEnvironment()).toThrow(McpError)
      expect(() => validateEnvironment()).toThrow(/CUCUMBERSTUDIO_UID/)
    })

    it('should throw McpError when multiple variables are missing', () => {
      delete process.env.CUCUMBERSTUDIO_ACCESS_TOKEN
      delete process.env.CUCUMBERSTUDIO_CLIENT_ID
      delete process.env.CUCUMBERSTUDIO_UID

      try {
        validateEnvironment()
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.message).toContain('CUCUMBERSTUDIO_ACCESS_TOKEN')
        expect(mcpError.message).toContain('CUCUMBERSTUDIO_CLIENT_ID')
        expect(mcpError.message).toContain('CUCUMBERSTUDIO_UID')
      }
    })

    it('should have correct error code', () => {
      delete process.env.CUCUMBERSTUDIO_ACCESS_TOKEN

      try {
        validateEnvironment()
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        expect((error as McpError).code).toBe(ErrorCode.InvalidRequest)
      }
    })
  })
})
