'use strict';

const path = require('node:path');
const {
  formatRate,
  cycle,
  timeoutIterator,
  memoize,
  createEmitter,
  PriorityQueue,
  asyncMap,
  asyncMapPromise,
  readStats,
} = require('currency-tracker');

console.log(formatRate('USD', 41.5));
console.log(formatRate('EUR', 45.1));

const rates = { USD: 41.5, EUR: 45.1, PLN: 10.4 };
const codes = Object.keys(rates);

const currencies = cycle(codes);
for (let i = 0; i < 5; i++) {
  console.log('Currency:', currencies.next().value);
}

// Імітація опитування API: курс трохи змінюється на кожному запиті
const pollRate = (code) => rates[code] * (1 + (Math.random() - 0.5) / 100);

const seconds = 1;
const totals = {};
for (const code of codes) {
  totals[code] = { sum: 0, count: 0 };
}

for (const code of timeoutIterator(cycle(codes), seconds)) {
  totals[code].sum += pollRate(code);
  totals[code].count++;
}

console.log(`Average rates for ${seconds} s:`);
for (const code of codes) {
  const { sum, count } = totals[code];
  console.log(formatRate(code, sum / count), `(${count} polls)`);
}

const cachedRate = memoize(pollRate, { ttl: 200 });
const first = cachedRate('USD').toFixed(3);
const second = cachedRate('USD').toFixed(3);
console.log(`Cached USD: ${first}, again from cache: ${second}`);
setTimeout(() => {
  console.log(`USD after TTL: ${cachedRate('USD').toFixed(3)}`);
}, 300);

const dropNewest = (cache) => [...cache.keys()].pop();
const lastRates = memoize(pollRate, { max: 2, policy: dropNewest });
const usd = lastRates('USD');
lastRates('EUR');
lastRates('PLN');
console.log('Custom policy kept USD:', lastRates('USD') === usd);

const emitter = createEmitter();

const watchRates = (rounds) => {
  const last = {};
  for (const code of codes) {
    last[code] = rates[code];
  }
  for (let i = 0; i < rounds; i++) {
    for (const code of codes) {
      const oldRate = last[code];
      const newRate = pollRate(code);
      last[code] = newRate;
      const percent = ((newRate - oldRate) / oldRate) * 100;
      emitter.emit('change', { code, oldRate, newRate, percent });
    }
  }
};

const printChange = (change) => {
  const { code, oldRate, newRate, percent } = change;
  const from = oldRate.toFixed(3);
  const to = newRate.toFixed(3);
  console.log(`${code}: ${from} -> ${to} (${percent.toFixed(2)}%)`);
};

const alertBigJump = (change) => {
  if (Math.abs(change.percent) > 0.3) {
    console.log(`ALERT: ${change.code} moved by ${change.percent.toFixed(2)}%`);
  }
};

const brokenListener = (change) => {
  if (change.code === 'PLN') {
    throw new Error('PLN handler is broken');
  }
};

let changesSeen = 0;
const countChanges = () => {
  changesSeen++;
  if (changesSeen === 3) {
    console.log('Counter unsubscribed after 3 changes');
    emitter.off('change', countChanges);
  }
};

const alerts = new PriorityQueue();

const queueAlert = (change) => {
  const item = `${change.code} moved by ${change.percent.toFixed(2)}%`;
  const priority = Math.abs(change.percent);
  alerts.enqueue(item, priority);
};

emitter.on('change', printChange);
emitter.on('change', brokenListener);
emitter.on('change', alertBigJump);
emitter.on('change', countChanges);
emitter.on('change', queueAlert);
emitter.on('error', (err) => console.log('Listener error:', err.message));

console.log('Watching rates:');
watchRates(2);

console.log(`Alerts in queue: ${alerts.size}`);
console.log('Highest:', alerts.dequeue('highest'));
console.log('Lowest:', alerts.dequeue('lowest'));
console.log('Oldest:', alerts.dequeue('oldest'));
console.log('Newest:', alerts.dequeue('newest'));
console.log(`Alerts left: ${alerts.size}`);

// Імітація запиту курсу до API із затримкою
const fetchRate = (code, callback, signal) => {
  const timer = setTimeout(() => {
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }
    if (!rates[code]) {
      callback(new Error(`Unknown currency: ${code}`));
      return;
    }
    callback(null, rates[code]);
  }, 100);
  const onAbort = () => clearTimeout(timer);
  if (signal) {
    signal.addEventListener('abort', onAbort);
  }
};

const printRates = (err, result) => {
  if (err) {
    console.log('asyncMap error:', err.message);
    return;
  }
  console.log('asyncMap result:', result);
};

asyncMap(codes, fetchRate, printRates);
asyncMap(['USD', 'GBP', 'EUR'], fetchRate, printRates);

asyncMapPromise(codes, fetchRate)
  .then((result) => console.log('Promise result:', result))
  .catch((err) => console.log('Promise error:', err.message));

const showRates = async () => {
  try {
    const result = await asyncMapPromise(['EUR', 'GBP'], fetchRate);
    console.log('await result:', result);
  } catch (err) {
    console.log('await error:', err.message);
  }
};

showRates();

const controller = new AbortController();
asyncMap(codes, fetchRate, printRates, controller.signal);
setTimeout(() => controller.abort(), 150);

const historyFile = path.join(__dirname, 'data', 'history.csv');
readStats(historyFile)
  .then((stats) => {
    console.log('CSV history stats:');
    for (const code of Object.keys(stats)) {
      const { count, sum, min, max } = stats[code];
      const average = (sum / count).toFixed(3);
      console.log(
        `${code}: ${count} rows, avg ${average}, min ${min}, max ${max}`,
      );
    }
  })
  .catch((err) => console.log('CSV error:', err.message));
