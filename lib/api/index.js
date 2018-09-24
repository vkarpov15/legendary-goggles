const cors = require('cors');
const { decorateApp } = require('@awaitjs/express');
const express = require('express');
const marked = require('marked');
const ts = require('../util/ts');

module.exports = async function api(config, db) {
  const app = decorateApp(express());

  app.use(cors());

  const Version = db.model('Version');

  app.get('/version/latest', async function(req, res) {
    const versions = await Version.
      find({ changelog: { $ne: null } }).
      sort({ publishedAt: -1 }).
      limit(10);

    versions.
      filter(v => v.changelog != null).
      forEach(v => { v.changelog = marked(v.changelog); });

    res.json({ versions });
  });

  const port = config.port || 3000;
  await app.listen(port);

  console.log(ts(), `Listening on port ${port}`);

  return app;
};
