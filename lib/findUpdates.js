'use strict';

const superagent = require('superagent');

const replicationUrl = 'https://skimdb.npmjs.com/registry/_changes';
const seqNumber = '4924874';

const pkgs = ['mongoose'];

module.exports = async function findUpdates() {
  const updated = await superagent.get(`${replicationUrl}?since=${seqNumber}`).
    then(res => res.body.results).
    then(res => res.filter(doc => pkgs.includes(doc.id)));

  return updated.map(pkg => pkg.id);
};
