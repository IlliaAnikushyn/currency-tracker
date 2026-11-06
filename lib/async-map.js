'use strict';

class AbortError extends Error {
  constructor() {
    super('Operation aborted');
    this.name = 'AbortError';
  }
}

const asyncMap = (items, fn, callback, signal) => {
  const results = [];
  let finished = false;

  const onAbort = () => {
    finish(new AbortError());
  };

  const finish = (err, data) => {
    if (finished) {
      return;
    }
    finished = true;
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }
    callback(err, data);
  };

  const step = (index) => {
    if (finished) {
      return;
    }
    if (index === items.length) {
      finish(null, results);
      return;
    }
    fn(
      items[index],
      (err, result) => {
        if (err) {
          finish(err, undefined);
          return;
        }
        results.push(result);
        step(index + 1);
      },
      signal,
    );
  };

  if (signal) {
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener('abort', onAbort);
  }

  step(0);
};

const asyncMapPromise = (items, fn, signal) =>
  new Promise((resolve, reject) => {
    asyncMap(
      items,
      fn,
      (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results);
      },
      signal,
    );
  });

module.exports = { AbortError, asyncMap, asyncMapPromise };
