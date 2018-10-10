const logger = require('../lib/logger');

global.MONGODB_URI = 'mongodb://localhost:27017/jsreport_test';

if (!process.env.D) {
  logger.transports = [];
}
