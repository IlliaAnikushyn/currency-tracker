'use strict';

function* cycle(items) {
  if (items.length === 0) {
    return;
  }
  let i = 0;
  while (true) {
    yield items[i];
    i++;
    if (i === items.length) {
      i = 0;
    }
  }
}

module.exports = { cycle };
