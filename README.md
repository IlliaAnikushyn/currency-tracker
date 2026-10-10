# Currency Tracker

A console tracker for fiat and crypto exchange rates, built with Node.js.
It fetches rates from public APIs, caches them, watches for changes
and sends alerts when a rate moves significantly.

> **Status:** in development. Features are added task by task (see below).

## Features

- Fiat exchange rates from the [National Bank of Ukraine API](https://bank.gov.ua/ua/open-data/api-dev)
- Crypto prices from the [CoinGecko API](https://www.coingecko.com/en/api)
- Response caching to avoid hitting API rate limits
- Rate change events and prioritized alerts
- Processing of large CSV files with rate history

## Requirements

- [Node.js](https://nodejs.org/) 22 or newer

## Installation

```bash
git clone https://github.com/IlliaAnikushyn/currency-tracker.git
cd currency-tracker
npm install
```

## Usage

```bash
npm start
```

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `npm start`      | Run the example app           |
| `npm run lint`   | Check the code with ESLint    |
| `npm run format` | Format the code with Prettier |

## Coursework

Coursework for the "Programming Fundamentals 2" course (Основи програмування 2), Igor Sikorsky KPI.

**Author:** Анікушин Ілля Романович (Illia Anikushyn), group ІМ-55

| #   | Task                            | Location                                                                                    |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Generators and iterators        | -                                                                                           |
| 2   | Project setup                   | `package.json`, `.gitignore`, `.editorconfig`, `LICENSE`, `eslint.config.js`, `.prettierrc` |
| 3   | Memoization                     | -                                                                                           |
| 4   | Double-ended priority queue     | -                                                                                           |
| 5   | Async array functions           | -                                                                                           |
| 6   | Large data processing (streams) | -                                                                                           |
| 7   | Events (EventEmitter)           | -                                                                                           |
| 8   | Auth proxy for an API client    | -                                                                                           |
| 9   | Logging decorator               | -                                                                                           |

## License

[MIT](LICENSE)
