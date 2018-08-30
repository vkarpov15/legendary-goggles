'use strict';

const superagent = require('superagent');

const replicationUrl = 'https://skimdb.npmjs.com/registry/_changes';
const seqNumber = '4870000';

const pkgs = ['mongoose'];

module.exports = async function findUpdates() {
  const updated = await superagent.get(`${replicationUrl}?since=${seqNumber}`).
    then(res => res.body.results).
    then(res => res.filter(doc => pkgs.includes(doc.id)));

  for (const pkg of updated) {
    console.log(pkg.id);
  }
};
