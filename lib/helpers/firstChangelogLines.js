'use strict';

module.exports = function firstLines(cl, n) {
  n = n || 3;
  cl = cl.split('\n').
    filter(line => line.trim().length > 0).
    filter(line => !line.match(/^[-=]+$/));
  cl = cl[0].match(/^[#\s[\]]*v?(\d+\.\d+\.\d+)/) ? cl.slice(1) : cl;

  return cl.slice(0, n).join('\n');
};
