import { HufiClient } from '../src/index';

const client = new HufiClient({
  reputationOracleUrl: 'https://rep.hu.finance',
});

if (client.reputationOracle) {
  console.log('Reputation oracle configured');
}
