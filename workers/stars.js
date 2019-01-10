const config = require('../config');
const lib = require('../lib');
const moment = require('moment');
const ts = require('../lib/util/ts');

run().catch(error => console.error(error.stack));

async function run() {
  const {
    db,
    updateNumGitHubStars
  } = await lib(config);

  while (true) {
    const pkgs = db.model('Package').find({
      $or: [
        { 'github.numStars': { $exists: false } },
        { 'github.updatedAt': { $lte: moment().subtract(1, 'days').toDate() } }
      ]
    }).cursor();

    for (let pkg = await pkgs.next(); pkg != null; pkg = await pkgs.next()) {
      await updateNumGitHubStars(pkg);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`${ts()} Done with this loop`);
    await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 60));
  }
}
