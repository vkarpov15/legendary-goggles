const { decorateApp } = require('@awaitjs/express');
const express = require('express');
const ts = require('../util/ts');

module.exports = async function api(config, db) {
  const app = decorateApp(express());

  const Version = db.model('Version');

  app.get('/version/latest', async function(req, res) {
    const versions = await Version.find().sort({ publishedAt: -1 }).limit(10);

    res.json({ versions });
  });

  const port = config.port || 3000;
  await app.listen(port);

  console.log(ts(), `Listening on port ${port}`);

  return app;
};
