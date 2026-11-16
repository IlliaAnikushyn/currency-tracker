'use strict';

const path = require('node:path');
const {
  BaseClient,
  AuthProxy,
  apiKeyAuth,
  bearerAuth,
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

  const tokenClient = new AuthProxy(
    new BaseClient(baseUrl),
    apiKeyAuth(apiKey),
  );
  const getNewToken = async () => {
    const res = await tokenClient.request({ method: 'POST', path: '/token' });
    console.log('Got new token:', res.data.token);
    return res.data.token;
  };
  const withToken = new RatesService(
    new AuthProxy(
      new BaseClient(baseUrl),
      bearerAuth('old-token', getNewToken),
    ),
  );
  console.log('Bearer, EUR:', await withToken.getRate('EUR'));
  console.log('Bearer, PLN:', await withToken.getRate('PLN'));

  server.close();
};

main();
