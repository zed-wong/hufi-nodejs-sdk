import type { HttpClient } from '../client';
import type { CheckCampaignProgressDto, TriggerCronJobDto, TriggerCronJobResponse } from '../types';

export class AdminApi {
  constructor(
    private client: HttpClient,
    private adminKey: string
  ) {}

  async checkCampaignProgress(params: CheckCampaignProgressDto): Promise<unknown> {
    return this.client.post<unknown>('/admin/check-campaign-progress', {
      body: params,
      adminKey: this.adminKey,
    });
  }

  async triggerCronJob(params: TriggerCronJobDto): Promise<TriggerCronJobResponse> {
    return this.client.post<TriggerCronJobResponse>('/admin/trigger-cron-job', {
      body: params,
      adminKey: this.adminKey,
    });
  }
}
