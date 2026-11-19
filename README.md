# Currency Tracker

A console currency rate tracker built with Node.js. It is a small library
(`lib/`) with an example app (`example/`) that uses it. Rates in the examples
are simulated or served by a local demo server.

## Features

- Polling rates for a limited time with generators and iterators
- Memoization with LRU, LFU, TTL and custom eviction policies
- Rate change events with independent listeners
- Prioritized alerts in a double-ended priority queue
- Async `map` with callbacks, promises and cancellation
- Streaming statistics over a large CSV file with rate history
- HTTP client with auth (API key, bearer token), logging and rate limit proxies
- Logging decorator with levels, text or JSON output

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
npm run generate
npm start
```

`npm run generate` creates the large CSV file used by task 6. Without it,
the example still runs and prints a `CSV error` for the missing file.

The example app prints a few formatted rates, cycles through currency codes
with a generator, then polls simulated rates for one second and prints
the average rate for each currency.

## Scripts

| Command            | Description                             |
| ------------------ | --------------------------------------- |
| `npm start`        | Run the example app                     |
| `npm run log`      | Run the logging decorator demo (task 9) |
| `npm run generate` | Generate a large CSV with rate history  |
| `npm run api`      | Run the API client demo (task 8)        |
| `npm run lint`     | Check the code with ESLint              |
| `npm run format`   | Format the code with Prettier           |

## Coursework

Coursework for the "Programming Fundamentals 2" course (Основи програмування 2), Igor Sikorsky KPI.

**Author:** Анікушин Ілля Романович (Illia Anikushyn), group ІМ-55

| #   | Task                            | Location                                                                                                                       |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Generators and iterators        | [`lib/generators.js`](lib/generators.js), [`lib/timeout.js`](lib/timeout.js), [`example/main.js`](example/main.js)             |
| 2   | Project setup                   | [`package.json`](package.json), [`lib/index.js`](lib/index.js), [`example/package.json`](example/package.json)                 |
| 3   | Memoization                     | [`lib/memoize.js`](lib/memoize.js), [`example/main.js`](example/main.js)                                                       |
| 4   | Double-ended priority queue     | [`lib/queue.js`](lib/queue.js), [`example/main.js`](example/main.js)                                                           |
| 5   | Async array functions           | [`lib/async-map.js`](lib/async-map.js), [`example/main.js`](example/main.js)                                                   |
| 6   | Large data processing (streams) | [`lib/csv-stats.js`](lib/csv-stats.js), [`example/generate-csv.js`](example/generate-csv.js)                                   |
| 7   | Events (EventEmitter)           | [`lib/events.js`](lib/events.js), [`example/main.js`](example/main.js)                                                         |
| 8   | Auth proxy for an API client    | [`lib/auth-proxy.js`](lib/auth-proxy.js), [`lib/proxies.js`](lib/proxies.js), [`example/api-demo.js`](example/api-demo.js)     |
| 9   | Logging decorator               | [`lib/logger.js`](lib/logger.js), [`lib/log-decorator.js`](lib/log-decorator.js), [`example/log-demo.js`](example/log-demo.js) |

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

**Task 3.** `memoize(fn, { max, policy, ttl })` works with any function: the
cache key is `JSON.stringify(args)`, and `has()` is used instead of `get()`, so
falsy results are cached too. When the cache is full, an eviction policy
(Strategy pattern) chooses the key to delete: `'lru'` (default), `'lfu'`, or
a custom function `(cache) => key`. For LRU, a cache hit moves the key to the
end of the `Map` (`delete` + `set`), so the first key is the least recently
used one. TTL is a separate option instead of a fourth policy, because it
answers another question (is the value still fresh?) and can be combined with
any policy. In the example, rates are cached with a TTL, and a custom policy
removes the newest key.

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

**Task 6.** `npm run generate` writes `example/data/history.csv` (1,000,000
rows, about 37 MB) with a write stream. When `write()` returns `false`, the
script waits for the `drain` event (backpressure), so the rows are not
buffered in memory. The file is generated, so it is ignored by git.
`readStats(file)` reads it with `fs.createReadStream` and `for await`, chunk
by chunk: each chunk is split into lines, and the last, possibly cut, line is
kept until the next chunk. Only the totals per currency (count, sum, min, max)
are kept in memory, never the whole file or an array of rows. A stream error
(for example, a missing file) rejects the returned `Promise`, so the caller
gets it in `.catch()`.

**Task 7.** `createEmitter()` is a small custom emitter instead of Node's
`EventEmitter`. Node stops calling listeners when one of them throws, so here
every listener is called inside `try/catch`, and the error is sent to the
separate `error` channel. If nobody listens to `error`, the error is printed
with `console.error` and the program keeps running. `off()` removes a listener
and deletes the event name when its last listener is gone. In the example,
`watchRates()` emits `change` events, and independent listeners print the
change, alert about big jumps and unsubscribe themselves after a few events.

**Task 8.** There are three independent layers, all with the same method
`request({ method, path, query, body, headers })`:

- `BaseClient` (`lib/http-client.js`) is a thin wrapper over `fetch` and knows
  nothing about authorization.
- Proxies get another client in the constructor, add their own behavior and
  delegate the request to it: `AuthProxy` (`lib/auth-proxy.js`),
  `LoggingProxy` and `RateLimitProxy` (`lib/proxies.js`).
- `RatesService` (`lib/rates-service.js`) gets a client in the constructor and
  imports nothing from the client or the proxies.

Everything is put together outside, in `example/api-demo.js`:
`new RatesService(new AuthProxy(new LoggingProxy(new RateLimitProxy(new BaseClient(url), 500)), strategy))`.
`AuthProxy` uses a Strategy: `apiKeyAuth(key)` adds an `x-api-key` header,
and `bearerAuth(token, getNewToken)` adds `Authorization: Bearer ...`. On a
`401` response, if the strategy can `refresh()`, the proxy gets a new token and
repeats the request once. The logging proxy is inside the auth proxy, so it
shows the failed request too. The API key is read from `.env`
(see `.env.example`). Public rate APIs do not offer bearer tokens that expire,
so `example/demo-server.js` is a small local `node:http` server that shows
this flow; it is a demonstration of the scheme, not a real API.

**Task 9.** `withLogging(fn, level)` returns a new function that logs the
call with its arguments, then the result or the error. The decorated function
knows nothing about the logger and behaves the same with or without the
decorator: a sync function stays sync, and an error is logged and thrown
again. If the result is a `Promise`, the decorator waits for it with `.then()`
and logs the resolved value or the rejection. `lib/logger.js` exports a
single `logger` instance (one logger for the whole system, thanks to the
`require` cache). Levels are `debug < info < error < critical`; the level
set with `logger.configure()` filters the records, so the `error` level logs
only failures. Each record has an ISO timestamp (`new Date().toISOString()`),
the format is `text` or `json`, and the output is the console or a file.

## License

[MIT](LICENSE)
