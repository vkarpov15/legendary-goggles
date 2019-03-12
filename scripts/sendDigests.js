const moment = require('moment');

run().then(() => console.log('done')).catch(error => console.error(error.stack));

async function run() {
  const lib = await require('../lib')(require('../config'));

  const lastFriday = moment().subtract(7, 'days').startOf('day').toDate();

  await lib.sendEmailDigests({ since: lastFriday });
}
