import type { HttpClient } from '../client';
import type {
  CampaignLeaderboardResponse,
  CheckJoinStatusDto,
  CheckJoinStatusResponse,
  ChainId,
  JoinCampaignDto,
  JoinCampaignResponse,
  LeaderboardRankBy,
  ListJoinedCampaignsParams,
  ListJoinedCampaignsResponse,
  UserProgressResponse,
} from '../types';

export class CampaignsApi {
  constructor(private client: HttpClient) {}

  async listJoined(params: ListJoinedCampaignsParams = {}): Promise<ListJoinedCampaignsResponse> {
    return this.client.get<ListJoinedCampaignsResponse>('/campaigns', {
      query: {
        status: params.status,
        limit: params.limit,
        skip: params.skip,
      },
      auth: true,
    });
  }

  async join(params: JoinCampaignDto): Promise<JoinCampaignResponse> {
    return this.client.post<JoinCampaignResponse>('/campaigns/join', {
      body: params,
      auth: true,
    });
  }

  async checkJoinStatus(params: CheckJoinStatusDto): Promise<CheckJoinStatusResponse> {
    return this.client.post<CheckJoinStatusResponse>('/campaigns/check-join-status', {
      body: params,
      auth: true,
    });
  }

  async getMyProgress(chainId: ChainId, campaignAddress: string): Promise<UserProgressResponse | null> {
    return this.client.get<UserProgressResponse | null>(
      `/campaigns/${chainId}-${campaignAddress}/my-progress`,
      { auth: true }
    );
  }

  async getLeaderboard(
    chainId: ChainId,
    campaignAddress: string,
    rankBy: LeaderboardRankBy
  ): Promise<CampaignLeaderboardResponse> {
    return this.client.get<CampaignLeaderboardResponse>(
      `/campaigns/${chainId}-${campaignAddress}/leaderboard`,
      {
        query: { rank_by: rankBy },
      }
    );
  }
}
