module.exports = fn => function(event, context, callback) {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  const queryParams = Object.keys(event.multiValueQueryStringParameters).
    reduce((obj, key) => {
      obj[key] = event.multiValueQueryStringParameters[key][0];
      return obj;
    }, {})
  fn(Object.assign({}, queryParams)).
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
