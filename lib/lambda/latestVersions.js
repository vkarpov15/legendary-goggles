const connect = require('./db');
const marked = require('marked');

exports.handler = function(event, context, callback) {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  latestVersions().
    then(res => {
      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(res)
      });
      console.log('done');
    }).
    catch(error => callback(error));
};

exports.latestVersions = latestVersions;

async function latestVersions() {
  const db = await connect();

  const versions = await db.model('Version').
    find({ changelog: { $ne: null } }).
    sort({ publishedAt: -1 }).
    limit(10);

  versions.
    filter(v => v.changelog != null).
    forEach(v => { v.changelog = marked(v.changelog); });

  return { versions };
}
