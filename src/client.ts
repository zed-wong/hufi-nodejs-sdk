import type { AuthResponse } from './types';

export interface HttpClientConfig {
  baseUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  onTokenRefresh?: (tokens: AuthResponse) => void;
}

export class HufiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'HufiError';
  }
}

export class HttpClient {
  private baseUrl: string;
  private accessToken?: string;
  private refreshToken?: string;
  private onTokenRefresh?: (tokens: AuthResponse) => void;
  private refreshPromise?: Promise<void>;

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://ro.hu.finance';
    this.accessToken = config.accessToken;
    this.refreshToken = config.refreshToken;
    this.onTokenRefresh = config.onTokenRefresh;
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = undefined;
    this.refreshToken = undefined;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new HufiError('No refresh token available', 401);
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new HufiError('Token refresh failed', response.status);
    }

    const tokens = (await response.json()) as AuthResponse;
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.onTokenRefresh?.(tokens);
  }

  async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      query?: Record<string, string | number | undefined>;
      auth?: boolean;
      adminKey?: string;
    } = {}
  ): Promise<T> {
    const { body, query, auth = false, adminKey } = options;

    let url = `${this.baseUrl}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          params.set(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (auth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (adminKey) {
      headers['X-Admin-API-Key'] = adminKey;
    }

    let response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle token refresh on 401
    if (response.status === 401 && auth && this.refreshToken) {
      if (!this.refreshPromise) {
        this.refreshPromise = this.refreshAccessToken().finally(() => {
          this.refreshPromise = undefined;
        });
      }
      await this.refreshPromise;

      headers['Authorization'] = `Bearer ${this.accessToken}`;
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    }

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      throw new HufiError(
        `Request failed: ${response.status} ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string, options?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, options?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('POST', path, options);
  }

  delete<T>(path: string, options?: Parameters<HttpClient['request']>[2]) {
    return this.request<T>('DELETE', path, options);
  }
}
