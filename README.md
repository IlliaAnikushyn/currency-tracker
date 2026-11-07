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
cd example
npm install
```

The example app in `example/` is a separate package. It depends on the library
through `"currency-tracker": "file:.."`, so it uses `require('currency-tracker')`
exactly like any other project that installs the library.

## Usage

```bash
npm start
```

The example app prints a few formatted rates, cycles through currency codes
with a generator, then polls simulated rates for one second and prints
the average rate for each currency.

## Scripts

| Command          | Description                   |
| ---------------- | ----------------------------- |
| `npm start`      | Run the example app           |
| `npm run lint`   | Check the code with ESLint    |
| `npm run format` | Format the code with Prettier |

## Coursework

Coursework for the "Programming Fundamentals 2" course (Основи програмування 2), Igor Sikorsky KPI.

**Author:** Анікушин Ілля Романович (Illia Anikushyn), group ІМ-55

| #   | Task                            | Location                                                                                                           |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Generators and iterators        | [`lib/generators.js`](lib/generators.js), [`lib/timeout.js`](lib/timeout.js), [`example/main.js`](example/main.js) |
| 2   | Project setup                   | [`package.json`](package.json), [`lib/index.js`](lib/index.js), [`example/package.json`](example/package.json)     |
| 3   | Memoization                     | -                                                                                                                  |
| 4   | Double-ended priority queue     | [`lib/queue.js`](lib/queue.js), [`example/main.js`](example/main.js)                                               |
| 5   | Async array functions           | [`lib/async-map.js`](lib/async-map.js), [`example/main.js`](example/main.js)                                       |
| 6   | Large data processing (streams) | -                                                                                                                  |
| 7   | Events (EventEmitter)           | [`lib/events.js`](lib/events.js), [`example/main.js`](example/main.js)                                             |
| 8   | Auth proxy for an API client    | -                                                                                                                  |
| 9   | Logging decorator               | -                                                                                                                  |

### Design decisions

**Task 1.** One generator is enough for the task, so the library has a single
infinite generator `cycle(items)` that returns currency codes in a loop.
`timeoutIterator(iterator, seconds)` is a hand-written iterator: it wraps any
other iterator and returns `{ value: undefined, done: true }` once the time is
up, so an infinite generator can be used safely in `for...of`. The time is
checked with `Date.now()` on every `next()` call instead of `setTimeout`,
because the loop is synchronous. The rates in the example are simulated;
real API requests are added in task 8.

**Task 2.** The library lives in the repository root (`main` is
`lib/index.js`), and the example app is a separate package in `example/`
that installs the library with `file:..`. `package-lock.json` files are
committed, while `node_modules/`, `.env`, logs and editor folders are ignored
(`.gitignore`). Code style is checked with ESLint (`eslint.config.js`) and
Prettier (`.prettierrc`, `.editorconfig`).

**Task 4.** `PriorityQueue` keeps two arrays with the same entry objects:
`byOrder` in insertion order and `byPriority` sorted by priority. All four
modes take an element from an edge of one array (`[0]` or the last one),
so there is no search. `dequeue()` only marks an entry as `removed`, and
`edge()` drops such entries when it finds them at the edge (lazy deletion).
A new entry goes after entries with the same priority. Insertion looks for
its place from the end, so it is O(n) in the worst case; binary search or
a heap would make it faster. In the example, a `change` listener puts an
alert into the queue with the size of the jump as its priority.

**Task 5.** The chosen array function is `map`. `asyncMap(items, fn, callback, signal)`
is the callback version: `fn(item, cb, signal)` must call `cb(err, result)`,
and the final `callback` gets `(err, results)` exactly once (guarded by the
`finished` flag). Items are processed one by one, so stopping the work is
simple: after an error or abort the next item is not started. This is slower
than running all items at once, but the order of results is kept.
`asyncMapPromise()` wraps the callback version in a `Promise`; the example
uses it with `.then()` and with `async/await`. With an `AbortSignal`, the map
ends with `AbortError`; the abort listener is removed in `finish()`, and
`fetchRate()` in the example clears its timer on abort.

**Task 7.** `createEmitter()` is a small custom emitter instead of Node's
`EventEmitter`. Node stops calling listeners when one of them throws, so here
every listener is called inside `try/catch`, and the error is sent to the
separate `error` channel. If nobody listens to `error`, the error is printed
with `console.error` and the program keeps running. `off()` removes a listener
and deletes the event name when its last listener is gone. In the example,
`watchRates()` emits `change` events, and independent listeners print the
change, alert about big jumps and unsubscribe themselves after a few events.

## License

[MIT](LICENSE)
