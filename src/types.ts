export type ChainId = 1 | 137;

export type CampaignStatus = 'active' | 'cancelled' | 'completed' | 'to_cancel';

export type ExchangeName =
  | 'bigone'
  | 'bitmart'
  | 'bybit'
  | 'gate'
  | 'htx'
  | 'kraken'
  | 'mexc'
  | 'upbit'
  | 'xt';

export type LeaderboardRankBy = 'rewards' | 'current_progress';

export interface PingResponse {
  node_env: string;
  git_hash: string;
}

export interface HealthStatus {
  status: string;
}

export interface HealthCheckResponse {
  status: string;
  info?: Record<string, HealthStatus & Record<string, unknown>>;
  error?: Record<string, HealthStatus & Record<string, unknown>>;
  details?: Record<string, HealthStatus & Record<string, unknown>>;
}

export interface ObtainNonceDto {
  address: string;
}

export interface ObtainNonceResponse {
  nonce: string;
}

export interface AuthDto {
  address: string;
  signature: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshDto {
  refresh_token: string;
}

export interface MarketMakingCampaignDetails {
  daily_volume_target: number;
}

export interface HoldingCampaignDetails {
  daily_balance_target: number;
}

export interface ThresholdCampaignDetails {
  minimum_balance_target: number;
}

interface BaseCampaign {
  chain_id: number;
  address: string;
  exchange_name: string;
  symbol: string;
  start_date: string;
  end_date: string;
  fund_amount: number;
  fund_token: string;
  status: string;
  processing_status: string;
  type: string;
}

export interface MarketMakingCampaign extends BaseCampaign {
  details: MarketMakingCampaignDetails;
}

export interface HoldingCampaign extends BaseCampaign {
  details: HoldingCampaignDetails;
}

export interface ThresholdCampaign extends BaseCampaign {
  details: ThresholdCampaignDetails;
}

export type Campaign = MarketMakingCampaign | HoldingCampaign | ThresholdCampaign;

export interface ListJoinedCampaignsResponse {
  has_more: boolean;
  results: Campaign[];
}

export interface ListJoinedCampaignsParams {
  status?: CampaignStatus;
  limit?: number;
  skip?: number;
}

export interface JoinCampaignDto {
  chain_id: number;
  address: string;
}

export interface JoinCampaignResponse {
  id: string;
}

export interface CheckJoinStatusDto {
  chain_id: number;
  address: string;
}

export type JoinStatus = 'already_joined' | 'can_join' | 'join_closed' | 'not_available';

export interface CheckJoinStatusResponse {
  status: JoinStatus;
  joined_at?: string;
  reason?: string;
}

export interface UserProgressResponse {
  from: string;
  to: string;
  my_score: number;
  my_meta: Record<string, unknown>;
  total_meta: Record<string, unknown>;
}

export interface LeaderboardEntry {
  address: string;
  result: number;
}

export interface CampaignLeaderboardResponse {
  data: LeaderboardEntry[];
}

export interface BitmartExtras {
  api_key_memo: string;
}

export interface EnrolledApiKey {
  exchange_name: string;
  api_key: string;
  extras?: BitmartExtras;
  is_valid: boolean;
  missing_permissions: string[];
}

export interface EnrollExchangeApiKeysDto {
  exchange_name: ExchangeName;
  api_key: string;
  secret_key: string;
  extras?: BitmartExtras;
}

export interface EnrollExchangeApiKeysResponse {
  id: string;
}

export interface TotalVolumeResponse {
  total_volume: number;
}

export interface CheckCampaignProgressDto {
  chain_id: number;
  address: string;
  from_date: string;
  to_date: string;
}

export type CronJobId =
  | 'refresh_icp_cache'
  | 'progress_recording'
  | 'discover_new_campaigns'
  | 'sync_campaign_statuses';

export interface TriggerCronJobDto {
  job_id: CronJobId;
}

export interface TriggerCronJobResponse {
  success: boolean;
}

export interface CampaignLauncherCampaignDetails {
  daily_volume_target?: number;
  daily_balance_target?: number;
  minimum_balance_target?: number;
}

export interface CampaignLauncherCampaignData {
  chain_id: number;
  address: string;
  type: string;
  exchange_name: string;
  symbol: string;
  details: CampaignLauncherCampaignDetails;
  start_date: string;
  end_date: string;
  fund_amount: string;
  fund_token: string;
  fund_token_symbol: string;
  fund_token_decimals: number;
  status: string;
  escrow_status: string;
  launcher: string;
  exchange_oracle: string;
  recording_oracle: string;
  reputation_oracle: string;
  balance: string;
  amount_paid: string;
  intermediate_results_url: Record<string, unknown>;
  final_results_url: Record<string, unknown>;
  created_at: number;
}

export interface CampaignLauncherCampaignsResponse {
  has_more: boolean;
  results: CampaignLauncherCampaignData[];
}

export interface CampaignLauncherDailyPaidAmount {
  date: string;
  amount: string;
}

export interface CampaignLauncherCampaignDataWithDetails extends CampaignLauncherCampaignData {
  daily_paid_amounts: CampaignLauncherDailyPaidAmount[];
  exchange_oracle_fee_percent: number;
  recording_oracle_fee_percent: number;
  reputation_oracle_fee_percent: number;
  reserved_funds: string;
}

export interface CampaignLauncherListParams {
  chain_id: ChainId;
  launcher?: string;
  status?: CampaignStatus;
  limit?: number;
  skip?: number;
}

export interface CampaignLauncherExchangeData {
  name: string;
  displayName: string;
  url: string;
  logo: string;
  type: string;
}

export type CampaignLauncherTradingPairsResponse = string[];

export type CampaignLauncherCurrenciesResponse = string[];

export interface CampaignLauncherCampaignsStats {
  n_active_campaigns: number;
  rewards_pool_usd: number;
  n_completed_campaigns: number;
  total_rewards_distributed: number;
}

export interface HufiClientConfig {
  baseUrl?: string;
  recordingOracleUrl?: string;
  campaignLauncherUrl?: string;
  reputationOracleUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  onTokenRefresh?: (tokens: AuthResponse) => void;
}
