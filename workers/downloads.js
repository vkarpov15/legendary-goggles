const config = require('../config');
const lib = require('../lib');
const ts = require('../lib/util/ts');

run().catch(error => console.error(error.stack));

async function run() {
  const {
    db,
    dlStats
  } = await lib(config);

  while (true) {
    // Update download counts
    const _pkgs = await db.model('Package').
      find({ downloadsMonth: { $ne: '201812' } }).
      limit(50);

    for (const pkg of _pkgs) {
      const { downloads } = await dlStats(pkg._id, '20181201', '20181231');
      pkg.downloadsLastMonth = downloads;
      pkg.downloadsMonth = '201812';
      console.log(`${ts()} ${pkg._id} ${downloads}`);
      await pkg.save();
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}
