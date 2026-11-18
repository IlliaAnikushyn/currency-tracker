'use strict';

const { logger } = require('./logger.js');

const withLogging = (fn, level = 'info') => {
  const name = fn.name || 'anonymous';

  const logError = (err) => {
    logger.log('error', `${name} failed`, { error: err.message });
  };

  return (...args) => {
    logger.log(level, `${name} called`, { args });
    let result;
    try {
      result = fn(...args);
    } catch (e) {
      logError(e);
      throw e;
    }
    if (result instanceof Promise) {
      return result.then(
        (value) => {
          logger.log(level, `${name} resolved`, { result: value });
          return value;
        },
        (err) => {
          logError(err);
          throw err;
        },
      );
    }
    logger.log(level, `${name} returned`, { result });
    return result;
  };
};

module.exports = { withLogging };
