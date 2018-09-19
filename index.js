const config = require('./.config');
const dbConnect = require('./lib/mongoose');
const findUpdates = require('./lib/findUpdates');
const get = require('./lib/util/get');
const postToSlack = require('./lib/postToSlack');
const ts = require('./lib/util/ts');
const updatePackage = require('./lib/updatePackage');

run().catch(error => console.error(error.stack));

async function run() {
  const db = await dbConnect(config.mongodb);

  const Account = db.model('Account');
  const State = db.model('State');

  const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
  const state = await State.findOneAndUpdate({}, {}, opts);

  while (true) {
    console.log(ts(), `Start loop at ${state.lastSequenceNumber}`);
    const start = Date.now();
    const { updated, lastSequenceNumber } =
      await findUpdates(state.lastSequenceNumber);

    for (const item of updated) {
      const { seq, id } = item;
      console.log(ts(), `Update package "${id}"`);

      const { pkg, newVersions } = await updatePackage(db)(id);

      state.lastSequenceNumber = seq;
      await state.save();

      const accounts = await Account.find({ packagesWatched: id });
      for (const account of accounts) {
        for (const hook of account.slackWebhooks) {
          for (const version of newVersions) {
            await postToSlack(hook, id, version.version, pkg.changelogUrl,
              version.changelog);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(ts(), `Done with this loop, elapsed ${Date.now() - start}. ` +
      'Waiting 10 seconds');

    const lastSeqNumUrl = 'https://replicate.npmjs.com/registry/_changes?' +
      'descending=true&limit=1';
    const { latestReleaseSeq: last_seq } = await get(lastSeqNumUrl);

    console.log(ts(), `We're behind by ${latestReleaseSeq - global.lastSequenceNumber} releases`);

    await new Promise(resolve => setTimeout(resolve, 10 * 1000));
  }
}
