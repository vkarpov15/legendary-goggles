const Slack = require('node-slack');
const assert = require('assert');
const config = require('./.config');
const findUpdates = require('./lib/findUpdates');
const { githubToSlack } = require('@atomist/slack-messages/Markdown');
const parseChangelog = require('./lib/parseChangelog');
const superagent = require('superagent');

const server = 'https://registry.npmjs.org';

run().catch(error => console.error(error.stack));

async function run() {
  const changelog = await getLatestChangelog('mongoose');

  await postToSlack('mongoose', '5.2.10', changelog);
}

//deps('mongoose', '5.2.9').catch(error => console.error(error.stack));

async function getLatestChangelog(pkg) {
  const { versions, repository } = await superagent.get(`${server}/${pkg}`).
    then(res => res.body);
  const version = Object.keys(versions).reverse()[0];

  const githubUrl = convertToGithubUrl(repository);
  const changelog = await getChangelog(githubUrl);
  const parsed = parseChangelog(changelog);
  return parsed[version];
}

async function postToSlack(pkg, version, changelog) {
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
    text: `${pkg} v${version} released. Changelog:\n\n${changelog}`,
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

function convertToGithubUrl(repo) {
  assert.equal(repo.type, 'git');
  assert.ok(repo.url.includes('github.com'));

  return 'https://github.com/' + repo.url.
    replace(/.*github\.com\//i, '').
    replace(/\.git$/i, '');
}

async function getChangelog(url) {
  const allowed = ['History.md', 'HISTORY.md', 'CHANGELOG.md'];

  url = url.replace('github.com', 'raw.githubusercontent.com');

  for (const file of allowed) {
    const md = await superagent.get(`${url}/master/${file}`).
      then(res => res.text).
      catch(() => null);
    if (md != null) {
      return md;
    }
  }

  return null;
}
