import { HufiClient } from '../src/index';

const client = new HufiClient({
  campaignLauncherUrl: 'https://cl.hu.finance',
});

const campaigns = await client.campaignLauncher.listCampaigns({
  chain_id: 137,
  status: 'active',
  limit: 5,
});

console.log(campaigns.results.length);

const campaign = await client.campaignLauncher.getCampaign(137, '0xCampaignAddress');
console.log(campaign.address);

const exchanges = await client.campaignLauncher.listExchanges();
console.log(exchanges.length);

const stats = await client.campaignLauncher.getCampaignsStats(137);
console.log(stats.n_active_campaigns);
