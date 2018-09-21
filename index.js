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
    const { updated } =
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

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(ts(), `Done with this loop, elapsed ${Date.now() - start}ms.`);

    const lastSeqNumUrl = 'https://replicate.npmjs.com/registry/_changes?' +
      'descending=true&limit=1';
    const { last_seq: latestReleaseSeq } = await get(lastSeqNumUrl);

    console.log(ts(), `We're behind by ${latestReleaseSeq - state.lastSequenceNumber}` +
      ` (${latestReleaseSeq}) releases`);

    if (latestReleaseSeq - state.lastSequenceNumber > 100) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}
