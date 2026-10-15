'use strict';

const { formatRate, cycle } = require('currency-tracker');

console.log(formatRate('USD', 41.5));
console.log(formatRate('EUR', 45.123));

const currencies = cycle(['USD', 'EUR', 'PLN']);
for (let i = 0; i < 5; i++) {
  console.log('Currency:', currencies.next().value);
}
