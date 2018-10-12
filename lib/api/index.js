const bodyParser = require('body-parser');
const cors = require('cors');
const { decorateApp } = require('@awaitjs/express');
const express = require('express');
const logger = require('../logger');

module.exports = async function api(lib) {
  const app = decorateApp(express());

  app.use(cors());
  app.use(bodyParser.json());

  app.getAsync('/state', async function(req, res) {
    res.json(await lib.getState());
  });

  app.getAsync('/feed', async function(req, res) {
    res.json(await lib.feed(req.query));
  });

  app.postAsync('/registerSlackOauth', async function(req, res) {
    logger.debug(req.body);
    res.json(await lib.registerSlackOauth(req.body));
  });

  app.useAsync(async function(error, req, res, next) {
    return res.json({ error: error.message });
  });

  return app;
};
