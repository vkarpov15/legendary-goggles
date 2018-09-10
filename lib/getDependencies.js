const superagent = require('superagent');

module.exports = getDependencies;

async function getDependencies(pkg, version) {
  const { versions, repository } = await superagent.get(`https://${server}/${pkg}`).
    then(res => res.body);
  const { dependencies } = versions[version];
}
