'use strict';

class LoggingProxy {
  constructor(client, log = console.log) {
    this.client = client;
    this.log = log;
  }

  async request(req) {
    const started = Date.now();
    const res = await this.client.request(req);
    const method = req.method || 'GET';
    const time = Date.now() - started;
    this.log(`${method} ${req.path} -> ${res.status} (${time} ms)`);
    return res;
  }
}

class RateLimitProxy {
  constructor(client, interval) {
    this.client = client;
    this.interval = interval;
    this.last = 0;
  }

  async request(req) {
    const next = Math.max(Date.now(), this.last + this.interval);
    this.last = next;
    const wait = next - Date.now();
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    return this.client.request(req);
  }
}

module.exports = { LoggingProxy, RateLimitProxy };
