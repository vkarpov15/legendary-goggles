const chalk = require('chalk');
const moment = require('moment');

module.exports = ts;

function ts() {
  return chalk.blue(moment().format('YYYYMMDD HH:mm:ss'));
}
