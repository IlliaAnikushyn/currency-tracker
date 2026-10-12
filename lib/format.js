'use strict';

const formatRate = (code, rate) => {
  return `${code}: ${rate.toFixed(2)} UAH`;
};

module.exports = { formatRate };
