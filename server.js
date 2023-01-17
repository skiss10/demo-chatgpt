// Using this app https://ably.com/accounts/23745/apps/43158

const Ably = require('ably');
const Express = require('express');
const ServerPort = process.env.PORT || 2000;
const worker = require('./worker');

const ApiKey = process.env.ABLY_API_KEY || 'INSERT-YOUR-API-KEY-HERE'; // Add your Ably key here 
if (ApiKey.indexOf('INSERT') === 0) { throw('Cannot run without an Ably API key. Add your key to server.js'); }

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'INSERT-YOUR-API-KEY-HERE'; // Add your OpenAPI key here 
if (ApiKey.indexOf('INSERT') === 0) { throw('Cannot run without an Ably API key. Add your key to server.js'); }

/* Instance the Ably library */
const rest = new Ably.Rest({ key: ApiKey });

/* Start a web server */
var app = Express();

/* Issue token requests to browser clients sending a request to the /auth endpoint */
app.get('/auth', function (req, res) {
  rest.auth.createTokenRequest(function(err, tokenRequest) {
    if (err) {
      res.status(500).send('Error requesting token: ' + JSON.stringify(err));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(tokenRequest));
    }
  });
});

/* Ensure OPENAI_API_KEY is set */
if ((OPENAI_API_KEY.indexOf('INSERT') === 0))  {
  app.get('/', function (req, res) {
    res.status(500).send('OPENAI_API_KEY is not set. You need to configure environment variable OPENAI_API_KEY');
  });
}

/* Server static HTML files from /public folder */
app.use(Express.static('public'));
app.listen(ServerPort);

const queueName = process.env.QUEUE_NAME || 'INSERT-YOUR-SERVER_ENDPOINT_AND_VHOST-HERE'; // Add your queue here, example: 'eu-west-3-d-queue.ably.io:1111/shared'
worker.start(ApiKey, OPENAI_API_KEY, 'chatgpt:response', 'openai', queueName);

console.log('Open the chatGPT demo in your browser: http://localhost:' + ServerPort + '/');
