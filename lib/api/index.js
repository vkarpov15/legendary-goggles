const cors = require('cors');
const { decorateApp } = require('@awaitjs/express');
const express = require('express');

module.exports = async function api(lib) {
  const app = decorateApp(express());

  app.use(cors());

  app.get('/state', async function(req, res) {
    res.json(await lib.getState());
  });

  app.use(async function(error, req, res, next) {
    return res.json({ error: error.message });
  });

  return app;
};
