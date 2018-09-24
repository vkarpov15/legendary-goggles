'use strict';

const superagent = require('superagent');
const ts = require('./util/ts');

// https://github.com/npm/registry/blob/master/docs/REPLICATE-API.md
const replicationUrl = 'https://replicate.npmjs.com/registry/_changes';

const fallbackUrl = 'https://skimdb.npmjs.com/registry/_changes';

module.exports = async function findUpdates(seqNumber) {
  const { results, last_seq: lastSequenceNumber } = await superagent.
    get(`${replicationUrl}?since=${seqNumber}&limit=100`).
    catch(err => {
      if (err.status === '503') {
        console.log(ts(), 'Falling back to skimdb');
        return superagent.
          get(`${fallbackUrl}?since=${seqNumber}&limit=100`);
      }
      throw err;
    }).
    then(res => res.body);

  return { updated: results, lastSequenceNumber };
};
