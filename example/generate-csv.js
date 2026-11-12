'use strict';

const fs = require('node:fs');
const path = require('node:path');

const total = Number(process.argv[2]) || 1000000;
const file = path.join(__dirname, 'data', 'history.csv');
const rates = { USD: 41.5, EUR: 45.1, PLN: 10.4 };
const codes = Object.keys(rates);
const start = Date.UTC(2020, 0, 1);

fs.mkdirSync(path.dirname(file), { recursive: true });
const out = fs.createWriteStream(file);

let i = 0;
const writeRows = () => {
  while (i < total) {
    const code = codes[i % codes.length];
    const rate = rates[code] * (1 + (Math.random() - 0.5) / 10);
    const date = new Date(start + i * 60000).toISOString();
    i++;
    if (!out.write(`${date},${code},${rate.toFixed(4)}\n`)) {
      out.once('drain', writeRows);
      return;
    }
  }
  out.end(() => console.log(`Written ${total} rows to ${file}`));
};

out.on('error', (err) => console.error('Write error:', err.message));
out.write('date,code,rate\n');
writeRows();
