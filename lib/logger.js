'use strict';

const fs = require('node:fs');

const LEVELS = { debug: 10, info: 20, error: 30, critical: 40 };

class Logger {
  constructor() {
    this.level = 'info';
    this.format = 'text';
    this.file = null;
  }

  configure({ level = this.level, format = this.format, file = this.file }) {
    if (!LEVELS[level]) {
      throw new Error(`Unknown log level: ${level}`);
    }
    this.level = level;
    this.format = format;
    this.file = file;
  }

  log(level, message, data = {}) {
    if (LEVELS[level] < LEVELS[this.level]) {
      return;
    }
    const time = new Date().toISOString();
    const line =
      this.format === 'json'
        ? JSON.stringify({ time, level, message, ...data })
        : `${time} [${level.toUpperCase()}] ${message} ${JSON.stringify(data)}`;
    if (this.file) {
      fs.appendFileSync(this.file, line + '\n');
    } else {
      console.log(line);
    }
  }
}

module.exports = { logger: new Logger() };
