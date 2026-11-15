'use strict';

const http = require('node:http');

const RATES = { USD: 41.5, EUR: 45.1, PLN: 10.4 };

const startDemoServer = (apiKey, port) => {
  let tokenNumber = 1;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };
    const hasKey = req.headers['x-api-key'] === apiKey;
    const hasToken =
      req.headers.authorization === `Bearer token-${tokenNumber}`;

    if (req.method === 'POST' && url.pathname === '/token') {
      if (!hasKey) {
        send(401, { error: 'Invalid API key' });
        return;
      }
      tokenNumber++;
      send(200, { token: `token-${tokenNumber}` });
      return;
    }
    if (url.pathname === '/rates') {
      if (!hasKey && !hasToken) {
        send(401, { error: 'Unauthorized' });
        return;
      }
      const code = url.searchParams.get('code');
      send(200, { code, rate: RATES[code] });
      return;
    }
    send(404, { error: 'Not found' });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
};

module.exports = { startDemoServer };
