const config = require('../config');
const lib = require('../lib');

run().catch(error => console.error(error.stack));

async function run() {
  const { db } = await lib(config);

  while (true) {
    const _pkgs = await db.model('Package').
      find({ random: { $exists: false } }).
      limit(50);

    for (const pkg of _pkgs) {
      pkg.random = Math.random();
      await pkg.save();
      console.log('Randomize', pkg._id);
    }

    const vs = await db.model('Version').
      find({ random: { $exists: false } }).
      limit(50);

    for (const v of vs) {
      v.random = Math.random();
      await v.save();
      console.log('Randomize', v.packageId, v.version);
    }
  }
}
