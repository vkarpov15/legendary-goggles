const Slack = require('node-slack');
const assert = require('assert');
const config = require('./.config');
const convertToGithubUrl = require('./lib/helpers/convertToGithubUrl');
const findUpdates = require('./lib/findUpdates');
const { githubToSlack } = require('@atomist/slack-messages/Markdown');
const http = require('http');
const parseChangelog = require('./lib/parseChangelog');
const superagent = require('superagent');

const server = 'registry.npmjs.org';

run().catch(error => console.error(error.stack));

async function run() {
  const pkg = 'run-rs';
  const { changelog, version, url } = await getLatestChangelog(pkg);

  await postToSlack(pkg, version, url, changelog);
}

//deps('mongoose', '5.2.9').catch(error => console.error(error.stack));

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

async function postToSlack(pkg, version, url, changelog) {
  const webhook = config.slackWebhook;
  const slack = new Slack(webhook, {});

  changelog = githubToSlack(changelog);

  const lines = changelog.split('\n');
  for (let i = 0; i < lines.length; ++i) {
    if (lines[i].startsWith('#')) {
      lines[i] = `*${lines[i].replace(/^#+/, '')}*`;
    }
    if (i + 1 < lines.length && /^[-=]+$/.test(lines[i + 1].trim())) {
      lines[i] = `*${lines[i]}*`;
      lines[i + 1] = '';
    }
  }

  changelog = lines.join('\n');

  await slack.send({
    text: `${pkg} v${version} released. <${url}|Changelog>:\n\n${changelog}`,
    channel: '#test',
    icon: ':mongoose:'
  });
}

async function deps(pkg, version) {
  const { versions, repository } = await superagent.get(`${server}/${pkg}`).
    then(res => res.body);
  const { dependencies } = versions[version];
  console.log(dependencies, repository);

  const githubUrl = convertToGithubUrl(repository);
  const changelog = await getChangelog(githubUrl);

  const parsed = parseChangelog(changelog);
  console.log(parsed[version]);
}

async function getChangelog(url) {
  const allowed = ['History.md', 'HISTORY.md', 'CHANGELOG.md'];

  const originalUrl = url;

  url = url.replace('github.com', 'raw.githubusercontent.com');

  for (const file of allowed) {
    const md = await superagent.get(`${url}/master/${file}`).
      then(res => res.text).
      catch(() => null);
    if (md != null) {
      return { changelog: md, url: `${originalUrl}/blob/master/${file}` };
    }
  }

  return null;
}
