const Library = require('../lib');
const { ObjectId } = require('mongoose').Types;
const assert = require('assert');
const sinon = require('sinon');
const slack = require('slack');

describe('slackOauth', function() {
  let lib;

  before(async function() {
    lib = await Library({ mongodb: 'mongodb://localhost:27017/jsreport' });
  });

  after(function() {
    lib.db.close();
  });

  beforeEach(async function() {
    await lib.db.dropDatabase();
  });

  afterEach(function() {
    slack.oauth.access.restore && slack.oauth.access.restore();
  });

  beforeEach(function() {
    sinon.stub(slack.oauth, 'access').returns({
      ok: true,
      scope: 'identify,incoming-webhook,chat:write:bot',
      'user_id': 'testUserId',
      'team_name': 'MongooseJS',
      'team_id': 'testTeamId',
      incoming_webhook: {
        channel: 'test',
        'channel_id': 'channelIdNotUsed',
        'configuration_url': 'configUrlNotUsed',
        url: 'https://hooks.slack.com/services/test123'
      }
    });
  });

  it('successfully creates a new user', async function() {
    const res = await lib.slackOauth({ code: 'testcode' });

    assert.equal(slack.oauth.access.getCalls().length, 1);
    assert.equal(slack.oauth.access.getCalls()[0].args[0].code, 'testcode');

    assert.ok(res.account);
    assert.ok(res.customer);

    const customer = await lib.db.model('Customer').findById(res.customer._id);
    assert.ok(customer);
    assert.ok(!customer.email);
    assert.equal(customer.slackId, 'testUserId');
    assert.equal(customer.accountIds.length, 1);
    assert.equal(customer.accountIds[0].toString(), res.account._id.toString());
  });

  it('modifies existing user', async function() {
    const oid = new ObjectId();
    await lib.db.model('Customer').create({
      slackId: 'testUserId',
      accountIds: [oid]
    });

    const res = await lib.slackOauth({ code: 'testcode' });

    assert.equal(slack.oauth.access.getCalls().length, 1);
    assert.equal(slack.oauth.access.getCalls()[0].args[0].code, 'testcode');

    assert.ok(res.account);
    assert.ok(res.customer);

    const customer = await lib.db.model('Customer').findById(res.customer._id);
    assert.ok(customer);
    assert.ok(!customer.email);
    assert.equal(customer.slackId, 'testUserId');
    assert.equal(customer.accountIds.length, 2);
    assert.deepEqual(customer.accountIds.map(id => id.toString()).sort(),
      [oid, res.account._id].map(id => id.toString()).sort());
  });
});
