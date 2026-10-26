'use strict';

const createEmitter = () => {
  const listeners = new Map();

  const on = (name, fn) => {
    if (!listeners.has(name)) {
      listeners.set(name, []);
    }
    listeners.get(name).push(fn);
  };

  const off = (name, fn) => {
    if (!listeners.has(name)) {
      return;
    }
    const list = listeners.get(name);
    const rest = list.filter((listener) => listener !== fn);
    if (rest.length === 0) {
      listeners.delete(name);
      return;
    }
    listeners.set(name, rest);
  };

  const reportError = (err) => {
    const errorListeners = listeners.get('error') || [];
    if (errorListeners.length === 0) {
      console.error('Unhandled listener error:', err);
      return;
    }
    for (const fn of errorListeners) {
      try {
        fn(err);
      } catch (e) {
        console.error('Error listener failed:', e);
      }
    }
  };

  const emit = (name, data) => {
    if (name === 'error') {
      reportError(data);
      return;
    }
    const list = listeners.get(name) || [];
    for (const fn of list) {
      try {
        fn(data);
      } catch (e) {
        reportError(e);
      }
    }
  };

  return { on, off, emit };
};

module.exports = { createEmitter };
