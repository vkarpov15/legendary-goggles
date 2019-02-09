const config = require('../config');
const lib = require('../lib');
const ts = require('../lib/util/ts');

run().catch(error => console.error(error.stack));

async function run() {
  const {
    db,
    postToSlack,
    postToTwitter,
    updatePackage
  } = await lib(config);

  while (true) {
    const seq = await db.model('SequenceNumber').
      findOneAndUpdate({ processed: false }, { $set: { processed: true } }, { new: false });

    if (seq == null) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      continue;
    }

    const { pkg, newVersions } = await updatePackage(seq.packageId);

    if (pkg != null) {
      await postToSlack(pkg, newVersions);

      if (pkg.downloadsLastMonth > 1e6) {
        await postToTwitter({ pkg, newVersions });
      }
    }
  }
}
