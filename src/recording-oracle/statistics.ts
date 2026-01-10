import type { HttpClient } from '../client';
import type { ExchangeName, TotalVolumeResponse } from '../types';

export class StatisticsApi {
  constructor(private client: HttpClient) {}

  async getTotalVolume(exchangeName?: ExchangeName): Promise<TotalVolumeResponse> {
    return this.client.get<TotalVolumeResponse>('/stats/total-volume', {
      query: { exchange_name: exchangeName },
    });
  }
}
