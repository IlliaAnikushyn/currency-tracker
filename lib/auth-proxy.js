'use strict';

const apiKeyAuth = (key, header = 'x-api-key') => ({
  sign: (req) => ({ ...req, headers: { ...req.headers, [header]: key } }),
});

class AuthProxy {
  constructor(client, strategy) {
    this.client = client;
    this.strategy = strategy;
  }

  async request(req) {
    return this.client.request(this.strategy.sign(req));
  }
}

module.exports = { apiKeyAuth, AuthProxy };
