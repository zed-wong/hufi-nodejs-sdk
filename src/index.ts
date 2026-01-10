import { HttpClient, HufiError } from './client';
import { AuthApi } from './recording-oracle/auth';
import { CampaignsApi } from './recording-oracle/campaigns';
import { ExchangeApiKeysApi } from './recording-oracle/exchange-api-keys';
import { HealthApi } from './recording-oracle/health';
import { StatisticsApi } from './recording-oracle/statistics';
import { AdminApi } from './recording-oracle/admin';
import { CampaignLauncherApi } from './campaign-launcher';
import { ReputationOracleApi } from './reputation-oracle';
import type { HufiClientConfig } from './types';

export class HufiClient {
  private recordingOracleClient: HttpClient;
  private campaignLauncherClient: HttpClient;
  private reputationOracleClient?: HttpClient;

  public readonly auth: AuthApi;
  public readonly campaigns: CampaignsApi;
  public readonly exchangeApiKeys: ExchangeApiKeysApi;
  public readonly health: HealthApi;
  public readonly statistics: StatisticsApi;
  public readonly campaignLauncher: CampaignLauncherApi;
  public readonly reputationOracle?: ReputationOracleApi;

  constructor(config: HufiClientConfig = {}) {
    const recordingOracleUrl = config.recordingOracleUrl ?? config.baseUrl ?? 'https://ro.hu.finance';
    const campaignLauncherUrl = config.campaignLauncherUrl ?? 'https://cl.hu.finance';

    this.recordingOracleClient = new HttpClient({
      baseUrl: recordingOracleUrl,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      onTokenRefresh: config.onTokenRefresh,
    });

    this.campaignLauncherClient = new HttpClient({
      baseUrl: campaignLauncherUrl,
    });

    if (config.reputationOracleUrl) {
      this.reputationOracleClient = new HttpClient({
        baseUrl: config.reputationOracleUrl,
      });
      this.reputationOracle = new ReputationOracleApi(this.reputationOracleClient);
    }

    this.auth = new AuthApi(this.recordingOracleClient);
    this.campaigns = new CampaignsApi(this.recordingOracleClient);
    this.exchangeApiKeys = new ExchangeApiKeysApi(this.recordingOracleClient);
    this.health = new HealthApi(this.recordingOracleClient);
    this.statistics = new StatisticsApi(this.recordingOracleClient);
    this.campaignLauncher = new CampaignLauncherApi(this.campaignLauncherClient);
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.recordingOracleClient.setTokens(accessToken, refreshToken);
  }

  admin(adminKey: string): AdminApi {
    return new AdminApi(this.recordingOracleClient, adminKey);
  }
}

export * from './types';
export { HufiError } from './client';
