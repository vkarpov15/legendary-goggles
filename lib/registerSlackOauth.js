const config = require('../.config');
const logger = require('./logger');

module.exports = db => async function registerStackOauth(params) {
  logger.debug({ function: 'registerStackOauth', params });
  return { params };
};
