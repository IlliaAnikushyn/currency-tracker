'use strict';

const memoize = (fn, max = Infinity) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    // LRU: коли є ключ в кеші і йде виклик, ключ переноситься в кінець як найсвіжіший (delete і set)
    // Якщо ключа нема і місця в кеші теж то видаляється найстаріший(перший) і в кінець додається новий свіжий
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    } else {
      if (cache.size >= max) {
        cache.delete(cache.keys().next().value);
      }
      const value = fn(...args);
      cache.set(key, value);
      return value;
    }
  };
};

module.exports = { memoize };
