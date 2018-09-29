const ts = require('../util/ts');

const logger = {
  log: (level, msg) => logger.transports.forEach(t => t.log(level, msg)),
  debug: msg => logger.log('debug', msg),
  info: msg => logger.log('info', msg),
  warn: msg => logger.log('warn', msg),
  error: msg => logger.log('error', msg)
};

logger.transports = [
  { name: 'stdout', log: (level, msg) => console.log(ts(), level, msg) }
];

module.exports = logger;
