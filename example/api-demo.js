'use strict';

const path = require('node:path');
const {
  BaseClient,
  AuthProxy,
  apiKeyAuth,
  RatesService,
} = require('currency-tracker');
const { startDemoServer } = require('./demo-server.js');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
  console.log('No .env file, copy .env.example to .env');
}

const apiKey = process.env.DEMO_API_KEY;
const port = 3456;

const main = async () => {
  const server = await startDemoServer(apiKey, port);
  const baseUrl = `http://localhost:${port}`;

  const withKey = new RatesService(
    new AuthProxy(new BaseClient(baseUrl), apiKeyAuth(apiKey)),
  );
  console.log('API key, USD:', await withKey.getRate('USD'));

  const noAuth = new RatesService(new BaseClient(baseUrl));
  try {
    await noAuth.getRate('USD');
  } catch (err) {
    console.log('Without auth:', err.message);
  }

  server.close();
};

main();
