const config = require('./.config');
const { get } = require('./lib/util/get');
const lib = require('./lib');
const ts = require('./lib/util/ts');

run().catch(error => console.error(error.stack));

async function run() {
  const {
    db,
    findUpdates,
    postToSlack,
    updatePackage
  } = await lib(config);

  const State = db.model('State');

  const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
  const state = await State.findOneAndUpdate({}, {}, opts);

  let loopDelay = 0;

  while (true) {
    console.log(ts(), `Start loop at ${state.lastSequenceNumber}`);
    const start = Date.now();
    const { updated } = await findUpdates(state.lastSequenceNumber).
      catch(() => ({}));

    if (updated == null) {
      console.log(ts(), 'findUpdates failed, retrying');
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    for (const item of updated) {
      const { seq, id } = item;
      console.log(ts(), `Update package "${id}"`);

      const { pkg, newVersions } = await updatePackage(id);

      state.lastSequenceNumber = seq;
      await state.save();

      if (pkg != null) {
        await postToSlack(pkg, newVersions);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(ts(), `Done with this loop, elapsed ${Date.now() - start}ms.`);

    // Failing to get the last seqnum shouldn't hold up the process
    try {
      const lastSeqNumUrl = 'https://replicate.npmjs.com/registry/_changes?' +
        'descending=true&limit=1';
      const latestReleaseSeq = await get(lastSeqNumUrl).then(res => res['last_seq']);

      if (latestReleaseSeq - state.lastSequenceNumber > 100) {
        loopDelay = 5000;
      } else if (updated.length === 0) {
        loopDelay += 20000;
      } else {
        loopDelay = 20000;
      }

      console.log(ts(), `We're behind by ${latestReleaseSeq - state.lastSequenceNumber}` +
        ` (${latestReleaseSeq}) releases, sleep for ${loopDelay} ms`);
    } catch (err) {
      console.log(ts(), `Error getting last seqnum: ${err.stack}`);
    }

    await new Promise(resolve => setTimeout(resolve, loopDelay));
  }
}
