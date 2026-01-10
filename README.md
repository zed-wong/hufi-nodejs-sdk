# hufi-sdk

Node.js SDK for the Hufi APIs (Recording Oracle and Campaign Launcher).

## Installation

```bash
bun add hufi-sdk
# or
npm install hufi-sdk
```

## Usage

### Initialize the client

```typescript
import { HufiClient } from 'hufi-sdk';

const client = new HufiClient({
  recordingOracleUrl: 'https://ro.hu.finance', // optional, this is the default
  campaignLauncherUrl: 'https://cl.hu.finance', // optional, this is the default
  // reputationOracleUrl: 'https://rep.hu.finance', // optional, future use
});
```

### Recording Oracle Health check

```typescript
const ping = await client.health.ping();
console.log(ping.node_env, ping.git_hash);

const health = await client.health.check();
console.log(health.status);
```

### Campaign Launcher Health check

```typescript
const ping = await client.campaignLauncher.ping();
console.log(ping.node_env, ping.git_hash);
```

### Authentication

The SDK uses Web3 wallet-based authentication. You'll need to sign a message with your wallet.

```typescript
// Get nonce for signing
const { nonce } = await client.auth.getNonce('0xYourAddress');

// Sign the nonce with your wallet
const signature = await client.auth.signNonce('0xYourPrivateKey', nonce);

// Authenticate
const tokens = await client.auth.authenticate({
  address: '0xYourAddress',
  signature,
});

// Tokens are automatically stored in the client
// You can also set tokens manually
client.setTokens(accessToken, refreshToken);
```

### Recording Oracle Campaigns

```typescript
// List joined campaigns
const { results, has_more } = await client.campaigns.listJoined({
  status: 'active',
  limit: 10,
});

// Join a campaign
await client.campaigns.join({
  chain_id: 137,
  address: '0xCampaignAddress',
});

// Check join status
const status = await client.campaigns.checkJoinStatus({
  chain_id: 137,
  address: '0xCampaignAddress',
});

// Get your progress
const progress = await client.campaigns.getMyProgress(137, '0xCampaignAddress');

// Get leaderboard
const leaderboard = await client.campaigns.getLeaderboard(
  137,
  '0xCampaignAddress',
  'rewards'
);
```

### Campaign Launcher Campaigns

```typescript
const { results, has_more } = await client.campaignLauncher.listCampaigns({
  chain_id: 137,
  status: 'active',
  limit: 10,
});

const campaign = await client.campaignLauncher.getCampaign(
  137,
  '0xCampaignAddress'
);
```

### Campaign Launcher Exchanges

```typescript
const exchanges = await client.campaignLauncher.listExchanges();
const pairs = await client.campaignLauncher.getExchangeTradingPairs('bybit');
const currencies = await client.campaignLauncher.getExchangeCurrencies('bybit');
```

### Campaign Launcher Statistics

```typescript
const stats = await client.campaignLauncher.getCampaignsStats(137);
```

### Reputation Oracle

```typescript
if (client.reputationOracle) {
  // Future API surface will live here
}
```

### Exchange API Keys

```typescript
// List enrolled API keys
const keys = await client.exchangeApiKeys.list();

// List exchange names
const exchanges = await client.exchangeApiKeys.listExchanges();

// Enroll API keys for an exchange
await client.exchangeApiKeys.enroll({
  exchange_name: 'bybit',
  api_key: 'your-api-key',
  secret_key: 'your-api-secret',
});

// Get API key for specific exchange
const key = await client.exchangeApiKeys.get('bybit');

// Delete API keys
await client.exchangeApiKeys.delete('bybit');
```

### Statistics

```typescript
const { total_volume } = await client.statistics.getTotalVolume();
```

### Admin API

```typescript
const admin = client.admin('your-admin-api-key');

// Check campaign progress
await admin.checkCampaignProgress({
  chain_id: 137,
  address: '0xCampaignAddress',
  from_date: '2024-01-01',
  to_date: '2024-01-31',
});

// Trigger cron job
await admin.triggerCronJob({ job_id: 'progress_recording' });
```

### Error Handling

```typescript
import { HufiClient, HufiError } from 'hufi-sdk';

try {
  await client.campaigns.join({ chain_id: 137, address: '0x...' });
} catch (error) {
  if (error instanceof HufiError) {
    console.log(error.status); // HTTP status code
    console.log(error.body);   // Response body
  }
}
```

### Token Refresh

The SDK automatically refreshes tokens when receiving a 401 response. You can also provide a callback to be notified when tokens are refreshed:

```typescript
const client = new HufiClient({
  accessToken: 'stored-access-token',
  refreshToken: 'stored-refresh-token',
  onTokenRefresh: (tokens) => {
    // Store new tokens
    saveTokens(tokens.access_token, tokens.refresh_token);
  },
});
```

## Supported Exchanges

- BigONE
- BitMart
- Bybit
- Gate.io
- HTX
- Kraken
- MEXC
- Upbit
- XT

## Supported Chains

- Ethereum (1)
- Polygon (137)

## License

MIT
