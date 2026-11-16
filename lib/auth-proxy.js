'use strict';

const apiKeyAuth = (key, header = 'x-api-key') => ({
  sign: (req) => ({ ...req, headers: { ...req.headers, [header]: key } }),
});

const bearerAuth = (token, getNewToken) => {
  let current = token;
  return {
    sign: (req) => ({
      ...req,
      headers: { ...req.headers, Authorization: `Bearer ${current}` },
    }),
    refresh: async () => {
      current = await getNewToken();
    },
  };
};

class AuthProxy {
  constructor(client, strategy) {
    this.client = client;
    this.strategy = strategy;
  }

  async request(req) {
    const res = await this.client.request(this.strategy.sign(req));
    if (res.status === 401 && this.strategy.refresh) {
      await this.strategy.refresh();
      const retry = await this.client.request(this.strategy.sign(req));
      return retry;
    }
    return res;
  }
}

module.exports = { apiKeyAuth, bearerAuth, AuthProxy };
