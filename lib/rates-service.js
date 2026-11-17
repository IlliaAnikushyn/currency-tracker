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
    if (typeof res.data.rate !== 'number') {
      throw new Error(`Unknown currency: ${code}`);
    }
    return res.data.rate;
  }
}

module.exports = { RatesService };
