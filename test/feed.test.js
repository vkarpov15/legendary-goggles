const Library = require('../lib');
const assert = require('assert');
const moment = require('moment');

describe('feed', function() {
  let lib;

  before(async function() {
    lib = await Library({ mongodb: 'mongodb://localhost:27017/jsreport' });

    await lib.db.dropDatabase();
  });

  after(function() {
    lib.db.close();
  });

  it('works', async function() {
    const Package = lib.db.model('Package');
    const Version = lib.db.model('Version');

    await Version.create([
      { packageId: 'mongoose', version: '5.0.1', publishedAt: moment('2018-01-17') },
      { packageId: 'mongodb', version: '3.1.0', publishedAt: moment('2018-01-16') },
      { packageId: 'mongoose', version: '5.0.0', publishedAt: moment('2018-01-15') }
    ]);

    await Package.create([
      { _id: 'mongoose', distTags: { latest: '5.0.1' } },
      { _id: 'mongodb', distTags: { latest: '3.1.0' } }
    ]);

    let { versions } = await lib.feed({ limit: 2 });

    assert.equal(versions.length, 2);
    assert.equal(versions[0].packageId, 'mongoose');
    assert.equal(versions[0].version, '5.0.1');
    assert.ok(versions[0].toJSON().package.distTags);

    assert.equal(versions[1].packageId, 'mongodb');
    assert.equal(versions[1].version, '3.1.0');
    assert.ok(versions[1].toJSON().package.distTags);

    ({ versions } = await lib.feed({ before: versions[1].publishedAt }));

    assert.equal(versions.length, 1);

    assert.equal(versions[0].packageId, 'mongoose');
    assert.equal(versions[0].version, '5.0.0');
    assert.ok(versions[0].toJSON().package.distTags);
  });
});
