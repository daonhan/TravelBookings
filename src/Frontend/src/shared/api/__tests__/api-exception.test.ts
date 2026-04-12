import { describe, it, expect } from 'vitest';
import { ApiException } from '../api-exception';
import type { ApiError } from '@/shared/types/common';

describe('ApiException', () => {
  describe('constructor', () => {
    it('creates an instance with all properties', () => {
      const ex = new ApiException('VALIDATION_ERROR', 'Invalid input', 'trace-123', 400);

      expect(ex).toBeInstanceOf(ApiException);
      expect(ex).toBeInstanceOf(Error);
      expect(ex.code).toBe('VALIDATION_ERROR');
      expect(ex.message).toBe('Invalid input');
      expect(ex.traceId).toBe('trace-123');
      expect(ex.httpStatus).toBe(400);
    });

    it('sets the name to "ApiException"', () => {
      const ex = new ApiException('NOT_FOUND', 'Not found', 'trace-456', 404);
      expect(ex.name).toBe('ApiException');
    });

    it('maintains proper prototype chain for instanceof', () => {
      const ex = new ApiException('INTERNAL_ERROR', 'Server error', 'trace-789', 500);
      expect(ex instanceof ApiException).toBe(true);
      expect(ex instanceof Error).toBe(true);
    });

    it('supports all error code types', () => {
      const codes = ['VALIDATION_ERROR', 'NOT_FOUND', 'CONFLICT', 'INTERNAL_ERROR'] as const;
      for (const code of codes) {
        const ex = new ApiException(code, `Error: ${code}`, 'trace-0', 400);
        expect(ex.code).toBe(code);
      }
    });
  });

  describe('fromErrorBody', () => {
    it('creates an ApiException from an error body and HTTP status', () => {
      const body: ApiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          traceId: 'abc-def-123',
        },
      };

      const ex = ApiException.fromErrorBody(body, 422);

      expect(ex).toBeInstanceOf(ApiException);
      expect(ex.code).toBe('VALIDATION_ERROR');
      expect(ex.message).toBe('Email is required');
      expect(ex.traceId).toBe('abc-def-123');
      expect(ex.httpStatus).toBe(422);
    });

    it('creates an ApiException for NOT_FOUND error', () => {
      const body: ApiError = {
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found',
          traceId: 'trace-not-found',
        },
      };

      const ex = ApiException.fromErrorBody(body, 404);

      expect(ex.code).toBe('NOT_FOUND');
      expect(ex.message).toBe('Booking not found');
      expect(ex.httpStatus).toBe(404);
    });

    it('creates an ApiException for CONFLICT error', () => {
      const body: ApiError = {
        error: {
          code: 'CONFLICT',
          message: 'Duplicate booking',
          traceId: 'trace-conflict',
        },
      };

      const ex = ApiException.fromErrorBody(body, 409);

      expect(ex.code).toBe('CONFLICT');
      expect(ex.httpStatus).toBe(409);
    });

    it('creates an ApiException for INTERNAL_ERROR', () => {
      const body: ApiError = {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong',
          traceId: 'trace-internal',
        },
      };

      const ex = ApiException.fromErrorBody(body, 500);

      expect(ex.code).toBe('INTERNAL_ERROR');
      expect(ex.httpStatus).toBe(500);
      expect(ex.name).toBe('ApiException');
    });
  });
});
