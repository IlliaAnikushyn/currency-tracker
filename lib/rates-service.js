'use strict';

class RatesService {
  constructor(client) {
    this.client = client;
  }

  async getRate(code) {
    const res = await this.client.request({ path: '/rates', query: { code } });
    if (res.status !== 200) {
      throw new Error(`Rate request failed with status ${res.status}`);
    }
    return res.data.rate;
  }
}

module.exports = { RatesService };
