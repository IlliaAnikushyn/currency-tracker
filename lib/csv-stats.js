'use strict';

const fs = require('node:fs');

const addLine = (stats, line) => {
  const parts = line.split(',');
  const code = parts[1];
  const rate = Number(parts[2]);
  if (!code || Number.isNaN(rate)) {
    return;
  }
  if (!stats[code]) {
    stats[code] = { count: 0, sum: 0, min: Infinity, max: -Infinity };
  }
  const stat = stats[code];
  stat.count = stat.count + 1;
  stat.sum = stat.sum + rate;
  stat.min = Math.min(stat.min, rate);
  stat.max = Math.max(stat.max, rate);
};

const readStats = async (filePath) => {
  const stats = {};
  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  let rest = '';
  for await (const chunk of stream) {
    const lines = (rest + chunk).split('\n');
    rest = lines.pop();
    for (const line of lines) {
      addLine(stats, line);
    }
  }
  addLine(stats, rest);
  return stats;
};

module.exports = { readStats };
