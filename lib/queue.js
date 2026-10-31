'use strict';

class PriorityQueue {
  constructor() {
    this.byPriority = [];
    this.size = 0;
  }

  enqueue(item, priority) {
    const entry = { item, priority };
    let i = this.byPriority.length;
    while (i > 0 && this.byPriority[i - 1].priority > priority) {
      i--;
    }
    this.byPriority.splice(i, 0, entry);
    this.size++;
  }

  peek(mode) {
    if (mode !== 'highest' && mode !== 'lowest') {
      throw new Error(`Unknown mode: ${mode}`);
    }
    if (this.byPriority.length === 0) {
      return undefined;
    }
    const index = mode === 'highest' ? this.byPriority.length - 1 : 0;
    return this.byPriority[index].item;
  }

  dequeue(mode) {
    if (mode !== 'highest' && mode !== 'lowest') {
      throw new Error(`Unknown mode: ${mode}`);
    }
    if (this.byPriority.length === 0) {
      return undefined;
    }
    const entry =
      mode === 'highest' ? this.byPriority.pop() : this.byPriority.shift();
    this.size--;
    return entry.item;
  }
}

module.exports = { PriorityQueue };
