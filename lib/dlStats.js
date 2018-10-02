const http = require('./util/get');
const moment = require('moment');

const root = 'https://api.npmjs.org/downloads/range';

module.exports = async function dlStats(pkgId, date) {
  // Convert format to 'YYYY-MM-DD' for both date and tomorrow's date
  let start = moment(date, 'YYYYMMDD');
  const end = start.clone().add(1, 'days').format('YYYY-MM-DD');
  start = start.format('YYYY-MM-DD');
  const { downloads } = await http.get(`${root}/${start}:${end}/${pkgId}`);

  return { downloads: downloads[0].downloads };
};
