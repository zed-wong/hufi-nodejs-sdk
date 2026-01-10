import { HufiClient } from '../src/index';

const client = new HufiClient({
  recordingOracleUrl: 'https://ro.hu.finance',
});

const { nonce } = await client.auth.getNonce('0xYourAddress');
console.log(nonce);

const signature = await client.auth.signNonce('0xYourPrivateKey', nonce);

const tokens = await client.auth.authenticate({
  address: '0xYourAddress',
  signature,
});

client.setTokens(tokens.access_token, tokens.refresh_token);

const campaigns = await client.campaigns.listJoined({
  status: 'active',
  limit: 10,
});

console.log(campaigns.has_more, campaigns.results.length);

const progress = await client.campaigns.getMyProgress(137, '0xCampaignAddress');
console.log(progress);
