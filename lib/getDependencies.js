const superagent = require('superagent');

const server = 'registry.npmjs.org';

module.exports = getDependencies;

async function getDependencies(pkg, version) {
  const { versions } = await superagent.get(`https://${server}/${pkg}`).
    then(res => res.body);
  const { dependencies } = versions[version];

  return dependencies;
}
