'use strict';

class BaseClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request({
    method = 'GET',
    path = '/',
    query = {},
    body,
    headers = {},
  }) {
    const url = new URL(path, this.baseUrl);
    for (const [name, value] of Object.entries(query)) {
      url.searchParams.set(name, value);
    }
    const options = { method, headers: { ...headers } };
    if (body !== undefined) {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, options);
    const type = response.headers.get('content-type') || '';
    const isJson = type.includes('application/json');
    const data = isJson ? await response.json() : await response.text();
    return { status: response.status, data };
  }
}

module.exports = { BaseClient };
