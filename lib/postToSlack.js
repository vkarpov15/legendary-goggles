const Slack = require('node-slack');
const { githubToSlack } = require('@atomist/slack-messages/Markdown');

const npmUrl = 'https://npmjs.org';

module.exports = db => async function postToSlack(pkg, newVersions) {
  const Account = db.model('Account');

  const accounts = await Account.find({ packagesWatched: pkg._id });
  for (const account of accounts) {
    for (const hook of account.slackWebhooks) {
      for (const version of newVersions) {
        const res = await _postToSlack(hook, pkg._id, version.version,
          pkg.changelogUrl, version.changelog);

        await db.model('Message').create({
          medium: 'SLACK',
          to: hook,
          content: res.text
        });
      }
    }
  }
};

async function _postToSlack(webhook, pkg, version, url, changelog, githubUrl) {
  const slack = new Slack(webhook, {});

  let text;
  if (changelog != null) {
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

    if (url == null) {
      text = `${pkg} v${version} released. Changelog:\n\n${changelog}`;
    } else {
      text = `${pkg} v${version} released. <${url}|Changelog>:\n\n${changelog}`;
    }
  } else if (githubUrl != null) {
    text = `${pkg} v${version} released. <${githubUrl}|See GitHub for more details>`;
  } else {
    `${pkg} v${version} released. <${npmUrl + '/package/' + pkg}|See npm for more details>`;
  }

  await slack.send({ text });

  return { text };
}
