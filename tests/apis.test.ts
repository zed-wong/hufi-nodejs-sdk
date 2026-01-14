import { expect, test } from 'bun:test';

import { HttpClient } from '../src/client';
import { AdminApi } from '../src/recording-oracle/admin';
import { AuthApi } from '../src/recording-oracle/auth';
import { CampaignsApi } from '../src/recording-oracle/campaigns';
import { ExchangeApiKeysApi } from '../src/recording-oracle/exchange-api-keys';
import { HealthApi } from '../src/recording-oracle/health';
import { StatisticsApi } from '../src/recording-oracle/statistics';
import { CampaignLauncherApi } from '../src/campaign-launcher';

type RequestCall = {
  method: string;
  path: string;
  options?: {
    body?: unknown;
    query?: Record<string, string | number | undefined>;
    auth?: boolean;
    adminKey?: string;
  };
};

class SpyHttpClient extends HttpClient {
  calls: RequestCall[] = [];

  constructor(private handler?: (call: RequestCall) => unknown) {
    super({ baseUrl: 'https://example.com' });
  }

  override async request<T>(
    method: string,
    path: string,
    options: RequestCall['options'] = {}
  ): Promise<T> {
    const call: RequestCall = { method, path, options };
    this.calls.push(call);

    const result = this.handler?.(call);
    return result as T;
  }
}

test('Recording Oracle AuthApi uses expected routes', async () => {
  const client = new SpyHttpClient((call) => {
    if (call.method === 'POST' && call.path === '/auth') {
      return { access_token: 'a0', refresh_token: 'r0' };
    }

    if (call.method === 'POST' && call.path === '/auth/refresh') {
      return { access_token: 'a1', refresh_token: 'r1' };
    }

    return undefined;
  });
  const api = new AuthApi(client);

  await api.getNonce('0xabc');
  await api.authenticate({ address: '0xabc', signature: 'sig' });
  await api.refresh('r0');
  await api.logout('r0');

  expect(client.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
    'POST /auth/nonce',
    'POST /auth',
    'POST /auth/refresh',
    'POST /auth/logout',
  ]);

  expect(client.calls[0]!.options?.body).toEqual({ address: '0xabc' });
  expect(client.calls[1]!.options?.body).toEqual({ address: '0xabc', signature: 'sig' });
  expect(client.calls[2]!.options?.body).toEqual({ refresh_token: 'r0' });
  expect(client.calls[3]!.options?.auth).toBe(true);
  expect(client.calls[3]!.options?.body).toEqual({ refresh_token: 'r0' });
});

test('Recording Oracle CampaignsApi uses expected routes', async () => {
  const client = new SpyHttpClient();
  const api = new CampaignsApi(client);

  await api.listJoined({ status: 'active', limit: 10, skip: 5 });
  await api.join({ chain_id: 137, address: '0xC' });
  await api.checkJoinStatus({ chain_id: 137, address: '0xC' });
  await api.getMyProgress(137, '0xC');
  await api.getLeaderboard(137, '0xC', 'rewards');

  expect(client.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
    'GET /campaigns',
    'POST /campaigns/join',
    'POST /campaigns/check-join-status',
    'GET /campaigns/137-0xC/my-progress',
    'GET /campaigns/137-0xC/leaderboard',
  ]);

  expect(client.calls[0]!.options).toMatchObject({
    auth: true,
    query: { status: 'active', limit: 10, skip: 5 },
  });

  expect(client.calls[1]!.options).toMatchObject({ auth: true, body: { chain_id: 137, address: '0xC' } });
  expect(client.calls[2]!.options).toMatchObject({ auth: true, body: { chain_id: 137, address: '0xC' } });
  expect(client.calls[3]!.options).toMatchObject({ auth: true });
  expect(client.calls[4]!.options?.query).toEqual({ rank_by: 'rewards' });
});

test('Recording Oracle ExchangeApiKeysApi uses expected routes', async () => {
  const client = new SpyHttpClient();
  const api = new ExchangeApiKeysApi(client);

  await api.list();
  await api.listExchanges();
  await api.enroll({ exchange_name: 'bybit', api_key: 'k', secret_key: 's' });
  await api.get('bybit');
  await api.delete('bybit');

  expect(client.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
    'GET /exchange-api-keys',
    'GET /exchange-api-keys/exchanges',
    'POST /exchange-api-keys',
    'GET /exchange-api-keys/bybit',
    'DELETE /exchange-api-keys/bybit',
  ]);

  for (const call of client.calls) {
    expect(call.options?.auth).toBe(true);
  }
});

test('Recording Oracle HealthApi uses expected routes', async () => {
  const client = new SpyHttpClient();
  const api = new HealthApi(client);

  await api.ping();
  await api.check();

  expect(client.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
    'GET /health/ping',
    'GET /health/check',
  ]);
});

test('Recording Oracle StatisticsApi uses expected routes', async () => {
  const client = new SpyHttpClient();
  const api = new StatisticsApi(client);

  await api.getTotalVolume();
  await api.getTotalVolume('bybit');

  expect(client.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
    'GET /stats/total-volume',
    'GET /stats/total-volume',
  ]);

  expect(client.calls[0]!.options?.query).toEqual({ exchange_name: undefined });
  expect(client.calls[1]!.options?.query).toEqual({ exchange_name: 'bybit' });
});

test('Recording Oracle AdminApi uses expected routes and admin key', async () => {
  const client = new SpyHttpClient();
  const api = new AdminApi(client, 'admin-key');

  await api.checkCampaignProgress({
    chain_id: 137,
    address: '0xC',
    from_date: '2024-01-01',
    to_date: '2024-01-02',
  });

  await api.triggerCronJob({ job_id: 'progress_recording' });

  expect(client.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
    'POST /admin/check-campaign-progress',
    'POST /admin/trigger-cron-job',
  ]);

  for (const call of client.calls) {
    expect(call.options?.adminKey).toBe('admin-key');
  }
});

test('Campaign Launcher uses expected routes', async () => {
  const client = new SpyHttpClient();
  const api = new CampaignLauncherApi(client);

  await api.ping();
  await api.listCampaigns({ chain_id: 137, status: 'active', limit: 10, skip: 5 });
  await api.getCampaign(137, '0xC');
  await api.listExchanges();
  await api.getExchangeTradingPairs('bybit');
  await api.getExchangeCurrencies('bybit');
  await api.getCampaignsStats(137);

  expect(client.calls.map((c) => `${c.method} ${c.path}`)).toEqual([
    'GET /health/ping',
    'GET /campaigns',
    'GET /campaigns/137-0xC',
    'GET /exchanges',
    'GET /exchanges/bybit/trading-pairs',
    'GET /exchanges/bybit/currencies',
    'GET /stats/campaigns',
  ]);

  expect(client.calls[1]!.options?.query).toEqual({
    chain_id: 137,
    launcher: undefined,
    status: 'active',
    limit: 10,
    skip: 5,
  });

  expect(client.calls[6]!.options?.query).toEqual({ chain_id: 137 });
});
