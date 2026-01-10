import type { HttpClient } from '../client';
import type {
  CampaignLauncherCampaignDataWithDetails,
  CampaignLauncherCampaignsResponse,
  CampaignLauncherCampaignsStats,
  CampaignLauncherCurrenciesResponse,
  CampaignLauncherExchangeData,
  CampaignLauncherListParams,
  CampaignLauncherTradingPairsResponse,
  ChainId,
  ExchangeName,
  PingResponse,
} from '../types';

export class CampaignLauncherApi {
  constructor(private client: HttpClient) {}

  async ping(): Promise<PingResponse> {
    return this.client.get<PingResponse>('/health/ping');
  }

  async listCampaigns(params: CampaignLauncherListParams): Promise<CampaignLauncherCampaignsResponse> {
    return this.client.get<CampaignLauncherCampaignsResponse>('/campaigns', {
      query: {
        chain_id: params.chain_id,
        launcher: params.launcher,
        status: params.status,
        limit: params.limit,
        skip: params.skip,
      },
    });
  }

  async getCampaign(
    chainId: ChainId,
    campaignAddress: string
  ): Promise<CampaignLauncherCampaignDataWithDetails> {
    return this.client.get<CampaignLauncherCampaignDataWithDetails>(
      `/campaigns/${chainId}-${campaignAddress}`
    );
  }

  async listExchanges(): Promise<CampaignLauncherExchangeData[]> {
    return this.client.get<CampaignLauncherExchangeData[]>('/exchanges');
  }

  async getExchangeTradingPairs(
    exchangeName: ExchangeName
  ): Promise<CampaignLauncherTradingPairsResponse> {
    return this.client.get<CampaignLauncherTradingPairsResponse>(
      `/exchanges/${exchangeName}/trading-pairs`
    );
  }

  async getExchangeCurrencies(
    exchangeName: ExchangeName
  ): Promise<CampaignLauncherCurrenciesResponse> {
    return this.client.get<CampaignLauncherCurrenciesResponse>(
      `/exchanges/${exchangeName}/currencies`
    );
  }

  async getCampaignsStats(chainId: ChainId): Promise<CampaignLauncherCampaignsStats> {
    return this.client.get<CampaignLauncherCampaignsStats>('/stats/campaigns', {
      query: { chain_id: chainId },
    });
  }
}
