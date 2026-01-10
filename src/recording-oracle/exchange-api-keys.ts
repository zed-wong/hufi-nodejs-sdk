import type { HttpClient } from '../client';
import type {
  EnrolledApiKey,
  EnrollExchangeApiKeysDto,
  EnrollExchangeApiKeysResponse,
  ExchangeName,
} from '../types';

export class ExchangeApiKeysApi {
  constructor(private client: HttpClient) {}

  async list(): Promise<EnrolledApiKey[]> {
    return this.client.get<EnrolledApiKey[]>('/exchange-api-keys', { auth: true });
  }

  async listExchanges(): Promise<string[]> {
    return this.client.get<string[]>('/exchange-api-keys/exchanges', { auth: true });
  }

  async enroll(params: EnrollExchangeApiKeysDto): Promise<EnrollExchangeApiKeysResponse> {
    return this.client.post<EnrollExchangeApiKeysResponse>('/exchange-api-keys', {
      body: params,
      auth: true,
    });
  }

  async get(exchangeName: ExchangeName): Promise<EnrolledApiKey> {
    return this.client.get<EnrolledApiKey>(`/exchange-api-keys/${exchangeName}`, { auth: true });
  }

  async delete(exchangeName: ExchangeName): Promise<void> {
    return this.client.delete<void>(`/exchange-api-keys/${exchangeName}`, { auth: true });
  }
}
