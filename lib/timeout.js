'use strict';

const timeoutIterator = (iterator, seconds) => {
  if (typeof seconds !== 'number' || seconds < 0 || Number.isNaN(seconds)) {
    throw new Error('Timeout must be a positive number');
  }
  const start = Date.now();
  const limit = seconds * 1000;

  return {
    next() {
      if (Date.now() - start >= limit) {
        return { value: undefined, done: true };
      } else {
        return iterator.next();
      }
    },
    [Symbol.iterator]() {
      return this;
    },
  };
};

module.exports = { timeoutIterator };
