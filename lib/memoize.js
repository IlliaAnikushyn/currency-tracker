'use strict';

const policies = {
  lru: (cache) => cache.keys().next().value,
  lfu: (cache) => {
    let bestKey;
    let lowestHits = Infinity;
    for (const [key, entry] of cache) {
      if (entry.hits < lowestHits) {
        bestKey = key;
        lowestHits = entry.hits;
      }
    }
    return bestKey;
  },
};

const memoize = (fn, options = {}) => {
  const { max = Infinity, policy = 'lru', ttl = Infinity } = options;
  const chooseKey = typeof policy === 'function' ? policy : policies[policy];
  if (!chooseKey) {
    throw new Error(`Unknown policy: ${policy}`);
  }
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      const entry = cache.get(key);
      const expired = Date.now() - entry.time >= ttl;
      if (!expired) {
        entry.hits++;
        cache.delete(key);
        cache.set(key, entry);
        return entry.value;
      }
      cache.delete(key);
    }
    if (cache.size >= max) {
      cache.delete(chooseKey(cache));
    }
    const value = fn(...args);
    cache.set(key, { value, hits: 1, time: Date.now() });
    return value;
  };
};

module.exports = { memoize };
