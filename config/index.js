'use strict';

const config = {};

try {
  require('./production');
} catch (err) {} /* eslint no-empty:0 */

const env = process.env.NODE_ENV || 'development';
Object.assign(config, require(`./${env}`));
console.log(`Using ${env}`);

module.exports = Object.freeze(config);
