'use strict';

const timeoutIterator = (iterator, seconds) => {
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
