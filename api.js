const api = require('./lib/api');
const config = require('./config');
const connect = require('./lib');

run().catch(error => console.error(error.stack));

async function run() {
  const lib = await connect(config);

  const app = await api(lib);

  const port = config.apiPort || 80;
  await app.listen(port);

  console.log(`Listening on port ${port}`);
}
