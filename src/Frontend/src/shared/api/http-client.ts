import type { ApiError } from '@/shared/types/common';
import { generateCorrelationId } from '@/shared/utils/correlation-id';
import { ApiException } from './api-exception';

// ---------------------------------------------------------------------------
// Token provider
// ---------------------------------------------------------------------------

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

/**
 * Registers a callback that the HTTP client will invoke before every request
 * to obtain an access token for the `Authorization` header.
 */
export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1_000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isRetryable(status: number): boolean {
  return status >= 500 && status < 600;
}

function buildUrl(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `${url}?${qs}` : url;
}

async function buildHeaders(hasBody: boolean): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'X-Correlation-Id': generateCorrelationId(),
  };

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function parseErrorBody(response: Response): Promise<ApiError | null> {
  try {
    const body = await response.json();
    if (body && typeof body === 'object' && 'error' in body) {
      return body as ApiError;
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Core fetch wrapper with retry logic for 5xx / network errors.
 */
async function request<T>(
  url: string,
  init: RequestInit,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);

      if (response.ok) {
        // 204 No Content — nothing to parse
        if (response.status === 204) {
          return undefined as T;
        }
        return (await response.json()) as T;
      }

      // Non-retryable client error — throw immediately
      if (!isRetryable(response.status)) {
        const errorBody = await parseErrorBody(response);
        if (errorBody) {
          throw ApiException.fromErrorBody(errorBody, response.status);
        }
        throw new ApiException(
          'INTERNAL_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
          '',
          response.status,
        );
      }

      // Retryable 5xx — store and back off
      lastError = response;

      if (attempt < MAX_RETRIES) {
        await sleep(INITIAL_BACKOFF_MS * Math.pow(2, attempt));
      }
    } catch (error) {
      // If it is already an ApiException with a non-retryable status, rethrow
      if (error instanceof ApiException && !isRetryable(error.httpStatus)) {
        throw error;
      }

      lastError = error;

      if (attempt < MAX_RETRIES) {
        await sleep(INITIAL_BACKOFF_MS * Math.pow(2, attempt));
      }
    }
  }

  // All retries exhausted
  if (lastError instanceof Response) {
    const errorBody = await parseErrorBody(lastError);
    if (errorBody) {
      throw ApiException.fromErrorBody(errorBody, lastError.status);
    }
    throw new ApiException(
      'INTERNAL_ERROR',
      `HTTP ${lastError.status}: ${lastError.statusText}`,
      '',
      lastError.status,
    );
  }

  if (lastError instanceof ApiException) {
    throw lastError;
  }

  throw new ApiException(
    'INTERNAL_ERROR',
    lastError instanceof Error ? lastError.message : 'Network error',
    '',
    0,
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const httpClient = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const fullUrl = buildUrl(url, params);
    const headers = await buildHeaders(false);
    return request<T>(fullUrl, { method: 'GET', headers });
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    const headers = await buildHeaders(body !== undefined);
    return request<T>(url, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async put<T>(url: string, body?: unknown): Promise<T> {
    const headers = await buildHeaders(body !== undefined);
    return request<T>(url, {
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  async del<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const fullUrl = buildUrl(url, params);
    const headers = await buildHeaders(false);
    return request<T>(fullUrl, { method: 'DELETE', headers });
  },
};
