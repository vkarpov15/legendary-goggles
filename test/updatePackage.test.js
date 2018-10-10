'use strict';

const Library = require('../lib');
const assert = require('assert');
const http = require('../lib/util/get');
const sinon = require('sinon');

describe('updatePackage', function() {
  let lib;

  before(async function() {
    lib = await Library({ mongodb: 'mongodb://localhost:27017/jsreport' });

    await lib.db.dropDatabase();
  });

  after(function() {
    lib.db.close();
  });

  it('works', async function() {
    const pkgData = require('./data/pkg');
    const stub = sinon.stub(http, 'get');
    stub.onFirstCall().resolves(pkgData);
    stub.returns(null);

    const { pkg, newVersions } = await lib.updatePackage('print-pkg-version');

    assert.ok(pkg);
    assert.equal(newVersions.length, 3);

    assert.deepEqual(newVersions.map(v => v.version).sort(),
      ['0.1.0', '0.2.0', '0.2.1']);
  });

  afterEach(function() {
    http.get.restore && http.get.restore();
  });
});
