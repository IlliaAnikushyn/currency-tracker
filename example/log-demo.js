'use strict';

const path = require('node:path');
const { withLogging, logger } = require('currency-tracker');

const rates = { USD: 41.5, EUR: 45.1 };

const toUah = (amount, code) => {
  if (!rates[code]) {
    throw new Error(`Unknown currency: ${code}`);
  }
  return amount * rates[code];
};

const loadRate = (code) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!rates[code]) {
        reject(new Error(`Unknown currency: ${code}`));
        return;
      }
      resolve(rates[code]);
    }, 100);
  });

const loggedToUah = withLogging(toUah);
const loggedLoadRate = withLogging(loadRate, 'debug');

const main = async () => {
  console.log('Level info:');
  console.log('Result:', loggedToUah(100, 'USD'));
  await loggedLoadRate('EUR');

  console.log('Level debug, JSON format:');
  logger.configure({ level: 'debug', format: 'json' });
  await loggedLoadRate('EUR');

  console.log('Level error, only failures:');
  logger.configure({ level: 'error', format: 'text' });
  loggedToUah(100, 'USD');
  try {
    loggedToUah(100, 'GBP');
  } catch (err) {
    console.log('Caught outside:', err.message);
  }
  try {
    await loggedLoadRate('GBP');
  } catch (err) {
    console.log('Caught outside:', err.message);
  }

  const file = path.join(__dirname, 'app.log');
  logger.configure({ level: 'info', file });
  loggedToUah(2, 'EUR');
  console.log('Written to', file);
};

main();
