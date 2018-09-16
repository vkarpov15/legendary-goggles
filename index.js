const config = require('./.config');
const dbConnect = require('./lib/mongoose');
const findUpdates = require('./lib/findUpdates');
const postToSlack = require('./lib/postToSlack');
const ts = require('./lib/util/ts');
const updatePackage = require('./lib/updatePackage');

run().catch(error => console.error(error.stack));

async function run() {
  const db = await dbConnect(config.mongodb);

  const State = db.model('State');

  const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
  const state = await State.findOneAndUpdate({}, {}, opts);

  while (true) {
    console.log(ts(), `Start loop at ${state.lastSequenceNumber}`);
    const { updated, lastSequenceNumber } =
      await findUpdates(state.lastSequenceNumber);

    for (const item of updated) {
      const { seq, id } = item;
      console.log(ts(), `Update package "${id}"`);

      const { pkg, newVersions } = await updatePackage(db)(id);

      state.lastSequenceNumber = seq;
      await state.save();

      if (config.packages.includes(id)) {
        for (const version of newVersions) {
          await postToSlack(id, version.version, pkg.changelogUrl, version.changelog);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2 * 1000));
    }

    state.lastSequenceNumber = lastSequenceNumber;
    await state.save();

    console.log(ts(), 'Done with this loop, waiting 2 mins');

    // Wait 5 minutes
    await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
  }
}
