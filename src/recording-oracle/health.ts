import type { HttpClient } from '../client';
import type { HealthCheckResponse, PingResponse } from '../types';

export class HealthApi {
  constructor(private client: HttpClient) {}

  async ping(): Promise<PingResponse> {
    return this.client.get<PingResponse>('/health/ping');
  }

  async check(): Promise<HealthCheckResponse> {
    return this.client.get<HealthCheckResponse>('/health/check');
  }
}
