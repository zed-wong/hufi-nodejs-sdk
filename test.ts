import { HufiClient } from './src/index';

async function main() {
  const client = new HufiClient();

  console.log('Testing health.ping...');
  const ping = await client.health.ping();
  console.log('Ping response:', ping);

  console.log('\nTesting health.check...');
  const health = await client.health.check();
  console.log('Health check:', health);

  console.log('\nTesting statistics.getTotalVolume...');
  const volume = await client.statistics.getTotalVolume();
  console.log('Total volume:', volume);

  console.log('\nAll tests passed!');
}

main().catch(console.error);
