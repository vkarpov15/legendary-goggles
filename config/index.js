'use strict';

const config = {};

try {
  require('./production');
} catch(err) {}

const env = process.env.NODE_ENV || 'development';
Object.assign(config, require(`./${env}`));
console.log(`Using ${env}`);

module.exports = Object.freeze(config);
