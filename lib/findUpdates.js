'use strict';

const superagent = require('superagent');

// https://github.com/npm/registry/blob/master/docs/REPLICATE-API.md
const replicationUrl = 'https://replicate.npmjs.com/registry/_changes';

module.exports = async function findUpdates(seqNumber) {
  const {
    results,
    last_seq: lastSequenceNumber
  } = await superagent.get(`${replicationUrl}?since=${seqNumber}&limit=25`).then(res => res.body);

  return { updated: results, lastSequenceNumber };
};
