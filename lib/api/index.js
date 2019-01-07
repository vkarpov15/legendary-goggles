const bodyParser = require('body-parser');
const cors = require('cors');
const { decorateApp } = require('@awaitjs/express');
const express = require('express');
const logger = require('../logger');

module.exports = async function api(lib) {
  const app = decorateApp(express());

  app.use(cors());
  app.use(bodyParser.json());

  const glob = req => Object.assign({}, req.query, req.body, req.params, {
    accessTokenId: req.headers.authorization
  });

  app.getAsync('/top', async function(req, res) {
    res.json(await lib.top(glob(req)));
  });

  app.getAsync('/state', async function(req, res) {
    res.json(await lib.getState());
  });

  app.getAsync('/home', async function(req, res) {
    res.json(await lib.latestVersions(glob(req)));
  });

  app.getAsync('/me', async function(req, res) {
    res.json(await lib.me(glob(req)));
  });

  app.putAsync('/me', async function(req, res) {
    res.json(await lib.updateCustomer(glob(req)));
  });

  app.getAsync('/version', async function(req, res) {
    res.json(await lib.getVersion(glob(req)));
  });

  app.putAsync('/account', async function(req, res) {
    res.json(await lib.updateAccount(glob(req)));
  });

  app.putAsync('/stripe', async function(req, res) {
    res.json(await lib.updateStripe(glob(req)));
  });

  app.getAsync('/feed', async function(req, res) {
    res.json(await lib.feed(glob(req)));
  });

  app.postAsync('/slack', async function(req, res) {
    logger.debug(req.body);
    res.json(await lib.slackOauth(glob(req)));
  });

  /* eslint no-unused-vars:0 */
  app.useAsync(async function(error, req, res, next) {
    return res.status(error.code || 500).json({ error: error.message, stack: error.stack });
  });

  return app;
};
