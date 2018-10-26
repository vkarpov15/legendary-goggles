const api = require('./lib/api');
const connect = require('./lib');

run().catch(error => console.error(error.stack));

async function run() {
  const lib = await connect(require('./.config'));

  const app = await api(lib);

  const port = process.env.PORT || 80;
  await app.listen(port);

  console.log(`Listening on port ${port}`);
}
