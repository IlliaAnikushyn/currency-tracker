'use strict';

const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    } else {
      const value = fn(...args);
      cache.set(key, value);
      return value;
    }
  };
};

module.exports = { memoize };
