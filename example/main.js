'use strict';

const { formatRate, cycle, timeoutIterator } = require('currency-tracker');

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
