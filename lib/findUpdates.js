'use strict';

const superagent = require('superagent');

const replicationUrl = 'https://skimdb.npmjs.com/registry/_changes';

module.exports = async function findUpdates(seqNumber) {
  const {
    results,
    last_seq: lastSequenceNumber
  } = await superagent.get(`${replicationUrl}?since=${seqNumber}`).then(res => res.body);

  return { updated: results.map(pkg => pkg.id), lastSequenceNumber };
};
