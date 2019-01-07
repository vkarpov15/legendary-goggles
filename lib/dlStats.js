const http = require('./util/get');
const moment = require('moment');

const root = 'https://api.npmjs.org/downloads/range';

module.exports = () => async function dlStats(pkgId, start, end) {
  // Convert format to 'YYYY-MM-DD' for both date and tomorrow's date
  start = moment(start, 'YYYYMMDD').format('YYYY-MM-DD');
  end = moment(end, 'YYYYMMDD').format('YYYY-MM-DD');
  const { downloads } = await http.get(`${root}/${start}:${end}/${pkgId}`).
    catch(error => {
      if (error.status === 404) {
        return { downloads: [{ downloads: 0 }] };
      }
      throw error;
    });

  const sum = downloads.reduce((sum, d) => sum + d.downloads, 0);
  return { downloads: sum };
};
