const assert = require('assert');
const dlStats = require('../lib/dlStats');
const http = require('../lib/util/get');
const sinon = require('sinon');

describe('dlStats', function() {
  it('works', async function() {
    const expectedUrl = 'https://api.npmjs.org/downloads/range/' +
      '2018-09-25:2018-09-26/mongoose';
    const stub = sinon.stub(http, 'get');

    stub.withArgs(expectedUrl).returns({
      start: '2018-09-25',
      end: '2018-09-26',
      package: 'mongoose',
      downloads: [
        { downloads: 9001, day: '2018-09-25' },
        { downloads: 0, day: '2018-09-26' }
      ]
    });
    stub.rejects('should not be called');

    const { downloads } = await dlStats('mongoose', '20180925');
    assert.strictEqual(downloads, 9001);
  });

  afterEach(function() {
    http.get.restore && http.get.restore();
  });
});
