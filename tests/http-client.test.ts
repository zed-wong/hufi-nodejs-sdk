import { afterEach, expect, test } from 'bun:test';

import { HttpClient, HufiError } from '../src/client';

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('HttpClient builds query string and headers', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return jsonResponse({ ok: true });
  }) as unknown as typeof fetch;

  const client = new HttpClient({ baseUrl: 'https://example.com', accessToken: 't' });

  await client.get<{ ok: true }>('/path', {
    auth: true,
    query: { a: 1, b: 'x', c: undefined },
  });

  expect(calls).toHaveLength(1);
  expect(calls[0]!.url).toBe('https://example.com/path?a=1&b=x');
  expect((calls[0]!.init?.headers as Record<string, string>)['Authorization']).toBe('Bearer t');
  expect((calls[0]!.init?.headers as Record<string, string>)['Content-Type']).toBe(
    'application/json'
  );
});

test('HttpClient returns undefined on 204', async () => {
  globalThis.fetch = (async () => {
    return new Response(null, { status: 204 });
  }) as unknown as typeof fetch;

  const client = new HttpClient({ baseUrl: 'https://example.com' });

  const result = await client.get<void>('/no-content');
  expect(result).toBeUndefined();
});

test('HttpClient throws HufiError with parsed JSON body', async () => {
  globalThis.fetch = (async () => {
    return jsonResponse({ message: 'bad' }, { status: 400, statusText: 'Bad Request' });
  }) as unknown as typeof fetch;

  const client = new HttpClient({ baseUrl: 'https://example.com' });

  await expect(client.get('/err')).rejects.toMatchObject({
    name: 'HufiError',
    status: 400,
    body: { message: 'bad' },
  } satisfies Partial<HufiError>);
});

test('HttpClient refreshes token once on 401 and retries request', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init });

    if (String(url) === 'https://example.com/protected') {
      const attempt = calls.filter((c) => c.url === 'https://example.com/protected').length;
      if (attempt === 1) {
        return jsonResponse({ message: 'unauthorized' }, { status: 401, statusText: 'Unauthorized' });
      }

      return jsonResponse({ ok: true }, { status: 200 });
    }

    if (String(url) === 'https://example.com/auth/refresh') {
      const refreshBody = init?.body ? JSON.parse(String(init.body)) : null;
      expect(refreshBody).toEqual({ refresh_token: 'r0' });

      return jsonResponse({ access_token: 'a1', refresh_token: 'r1' }, { status: 200 });
    }

    return jsonResponse({ message: 'unexpected url' }, { status: 500 });
  }) as unknown as typeof fetch;

  let refreshed: { access_token: string; refresh_token: string } | undefined;

  const client = new HttpClient({
    baseUrl: 'https://example.com',
    accessToken: 'a0',
    refreshToken: 'r0',
    onTokenRefresh: (tokens) => {
      refreshed = tokens;
    },
  });

  const result = await client.get<{ ok: true }>('/protected', { auth: true });
  expect(result).toEqual({ ok: true });
  expect(refreshed).toEqual({ access_token: 'a1', refresh_token: 'r1' });

  const protectedCalls = calls.filter((c) => c.url === 'https://example.com/protected');
  expect(protectedCalls).toHaveLength(2);

  const retryHeaders = protectedCalls[1]!.init?.headers as Record<string, string>;
  expect(retryHeaders['Authorization']).toBe('Bearer a1');
});
