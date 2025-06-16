import { describe, it, expect } from 'vitest';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { createMcpError, safeExecute } from './errors.js';

describe('errors utilities', () => {
  describe('createMcpError', () => {
    it('should return McpError as-is', () => {
      const originalError = new McpError(ErrorCode.InvalidParams, 'Test error');
      const result = createMcpError(originalError);

      expect(result).toBe(originalError);
    });

    it('should convert CucumberStudioApiError to McpError', () => {
      const apiError = new Error('API failed');
      apiError.name = 'CucumberStudioApiError';

      const result = createMcpError(apiError, 'test context');

      expect(result).toBeInstanceOf(McpError);
      expect(result.code).toBe(ErrorCode.InternalError);
      expect(result.message).toBe('Cucumber Studio API error (test context): API failed');
    });

    it('should convert ZodError to McpError', () => {
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';

      const result = createMcpError(zodError);

      expect(result).toBeInstanceOf(McpError);
      expect(result.code).toBe(ErrorCode.InvalidParams);
      expect(result.message).toBe('Validation error: Validation failed');
    });

    it('should convert generic Error to McpError', () => {
      const genericError = new Error('Something went wrong');

      const result = createMcpError(genericError, 'operation');

      expect(result).toBeInstanceOf(McpError);
      expect(result.code).toBe(ErrorCode.InternalError);
      expect(result.message).toBe('operation: Something went wrong');
    });

    it('should handle unknown error types', () => {
      const unknownError = 'string error';

      const result = createMcpError(unknownError);

      expect(result).toBeInstanceOf(McpError);
      expect(result.code).toBe(ErrorCode.InternalError);
      expect(result.message).toBe('Unknown error: string error');
    });

    it('should handle context parameter', () => {
      const error = new Error('Test error');

      const result = createMcpError(error, 'test context');

      expect(result.message).toBe('test context: Test error');
    });
  });

  describe('safeExecute', () => {
    it('should return result on successful execution', async () => {
      const operation = async () => 'success';

      const result = await safeExecute(operation);

      expect(result).toBe('success');
    });

    it('should throw McpError on operation failure', async () => {
      const operation = async () => {
        throw new Error('Operation failed');
      };

      await expect(safeExecute(operation, 'test operation')).rejects.toThrow(McpError);
    });

    it('should preserve context in error', async () => {
      const operation = async () => {
        throw new Error('Operation failed');
      };

      try {
        await safeExecute(operation, 'test operation');
      } catch (error) {
        expect(error).toBeInstanceOf(McpError);
        expect((error as McpError).message).toBe('test operation: Operation failed');
      }
    });

    it('should handle async operations that return promises', async () => {
      const operation = () => Promise.resolve(42);

      const result = await safeExecute(operation);

      expect(result).toBe(42);
    });

    it('should handle operations that throw McpError directly', async () => {
      const originalError = new McpError(ErrorCode.InvalidParams, 'Invalid input');
      const operation = async () => {
        throw originalError;
      };

      try {
        await safeExecute(operation);
      } catch (error) {
        expect(error).toBe(originalError);
      }
    });
  });
});