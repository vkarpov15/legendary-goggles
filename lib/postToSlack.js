const Slack = require('node-slack');
const config = require('../.config');
const { githubToSlack } = require('@atomist/slack-messages/Markdown');

module.exports = postToSlack;

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
