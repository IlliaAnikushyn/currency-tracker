'use strict';

function* cycle(items) {
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
