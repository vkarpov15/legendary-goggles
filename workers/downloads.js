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
    const pkg = await db.model('Package').
      findOneAndUpdate({ downloadsMonth: { $ne: '201902' } }, { downloadsMonth: '201902' }, { new: false });

    if (pkg == null) {
      await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 60));
      continue;
    }

    const { downloads } = await dlStats(pkg._id, '20190101', '20190131');
    pkg.downloadsLastMonth = downloads;
    pkg.downloadsMonth = '201901';
    console.log(`${ts()} ${pkg._id} ${downloads}`);
    await pkg.save();

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
