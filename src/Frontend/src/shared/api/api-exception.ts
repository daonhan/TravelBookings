import type { ApiError, ApiErrorCode } from '@/shared/types/common';

/**
 * Custom error class for API failures. Carries structured error information
 * from the server response, including the trace ID for diagnostics.
 */
export class ApiException extends Error {
  public readonly code: ApiErrorCode;
  public readonly traceId: string;
  public readonly httpStatus: number;

  constructor(
    code: ApiErrorCode,
    message: string,
    traceId: string,
    httpStatus: number,
  ) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.traceId = traceId;
    this.httpStatus = httpStatus;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiException.prototype);
  }

  /**
   * Creates an `ApiException` from a parsed API error response body.
   */
  static fromErrorBody(body: ApiError, httpStatus: number): ApiException {
    return new ApiException(
      body.error.code,
      body.error.message,
      body.error.traceId,
      httpStatus,
    );
  }
}
