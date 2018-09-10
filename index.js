const assert = require('assert');
const config = require('./.config');
const convertToGithubUrl = require('./lib/helpers/convertToGithubUrl');
const findUpdates = require('./lib/findUpdates');
const getChangelog = require('./lib/getChangelog');
const http = require('http');
const parseChangelog = require('./lib/parseChangelog');
const postToSlack = require('./lib/postToSlack');
const superagent = require('superagent');

const server = 'registry.npmjs.org';

run().catch(error => console.error(error.stack));

async function run() {
  const updated = await findUpdates();

  for (const pkg of updated) {
    console.log('Found', pkg)
    const { changelog, version, url } = await getLatestChangelog(pkg);

    await postToSlack(pkg, version, url, changelog);
  }
}

async function getLatestChangelog(pkg) {
  // Use native HTTP because superagent struggles with application/octet-stream,
  // which is what npm gives you for very large packages.
  // See https://github.com/visionmedia/superagent/issues/402
  const res = await new Promise((resolve, reject) => {
    const opts = {
      method: 'GET',
      hostname: server,
      path: `/${pkg}`
    };
    let str = '';
    const request = http.request(opts, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        str += chunk.toString('utf8');
      });
      res.on('end', () => {
        resolve(JSON.parse(str))
      });
      res.on('error', err => reject(err));
    });

    request.on('error', error => reject(error));
    request.end();
  });

  const { versions, repository } = res;
  const version = Object.keys(versions).reverse()[0];

  const githubUrl = convertToGithubUrl(repository);
  console.log('Getting changelog');
  const { changelog, url } = await getChangelog(githubUrl);
  const parsed = parseChangelog(changelog);
  return { changelog: parsed[version], version, url };
}
