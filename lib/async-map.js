'use strict';

const asyncMap = (items, fn, callback) => {
  const results = [];
  let finished = false;

  const finish = (err, data) => {
    if (finished) {
      return;
    }
    finished = true;
    callback(err, data);
  };

  const step = (index) => {
    if (index === items.length) {
      finish(null, results);
      return;
    }
    fn(items[index], (err, result) => {
      if (err) {
        finish(err, undefined);
        return;
      }
      results.push(result);
      step(index + 1);
    });
  };

  step(0);
};

const asyncMapPromise = (items, fn) =>
  new Promise((resolve, reject) => {
    asyncMap(items, fn, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });

module.exports = { asyncMap, asyncMapPromise };
