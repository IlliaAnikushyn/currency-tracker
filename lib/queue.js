'use strict';

const MODES = {
  highest: { list: 'byPriority', fromStart: false },
  lowest: { list: 'byPriority', fromStart: true },
  oldest: { list: 'byOrder', fromStart: true },
  newest: { list: 'byOrder', fromStart: false },
};

class PriorityQueue {
  constructor() {
    this.byOrder = [];
    this.byPriority = [];
    this.size = 0;
  }

  enqueue(item, priority) {
    const entry = { item, priority, removed: false };
    this.byOrder.push(entry);
    let i = this.byPriority.length;
    while (i > 0 && this.byPriority[i - 1].priority > priority) {
      i--;
    }
    this.byPriority.splice(i, 0, entry);
    this.size++;
  }

  edge(mode) {
    const side = MODES[mode];
    if (!side) {
      throw new Error(`Unknown mode: ${mode}`);
    }
    const list = this[side.list];
    while (list.length > 0) {
      const entry = side.fromStart ? list[0] : list[list.length - 1];
      if (!entry.removed) {
        return entry;
      }
      if (side.fromStart) {
        list.shift();
      } else {
        list.pop();
      }
    }
    return undefined;
  }

  peek(mode) {
    const entry = this.edge(mode);
    return entry ? entry.item : undefined;
  }

  dequeue(mode) {
    const entry = this.edge(mode);
    if (!entry) {
      return undefined;
    }
    entry.removed = true;
    this.size--;
    return entry.item;
  }
}

module.exports = { PriorityQueue };
