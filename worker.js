const amqp = require('amqplib/callback_api');
const Ably = require('ably');

/* Send text query to chatGPT */
async function askAndPublish(ablyChannel, text, openai) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: text,
      max_tokens: 5, //NOTE: increasing this allows the requrest to have more characters
      temperature: 0
    });
    const message = response.data.choices[0].text;
    publishAnswer(ablyChannel, text, message);
  } catch (error) {
    console.log(error);
  }
}

/* Publish chatGPT response to Ably Channel */
function publishAnswer(ablyChannel, rawText, resonseText) {
  ablyChannel.publish('text', { resonseText: resonseText}, function(err) {
    if (err) {
      console.error('worker:', 'Failed to publish text', rawText, ' - err:', JSON.stringify(err));
    }
  })
}

/* Start the worker that consumes from the AMQP Queue */
exports.start = function(apiKey, OPENAI_API_KEY, responseChannelName, queueName, queueEndpoint) {
  const { Configuration, OpenAIApi } = require("openai");
  const appId = apiKey.split('.')[0];
  const queue = appId + ":" + queueName;
  const endpoint = queueEndpoint;
  const url = 'amqps://' + apiKey + '@' + endpoint;
  const rest = new Ably.Rest({ key: apiKey });
  const responseChannel = rest.channels.get(responseChannelName);
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  /* Connect to Ably queue */
  amqp.connect(url, (err, conn) => {
    if (err) {
      console.error('worker:', 'Queue error!', err);
      return;
    }
    console.log('worker:', 'Connected to AMQP endpoint', endpoint);

    /* Create a communication channel */
    conn.createChannel((err, ch) => {
      if (err) {
        console.error('worker:', 'Queue error!', err);
        return;
      }
      console.log('worker:', 'Waiting for messages');

      /* Wait for messages published to the Ably Reactor queue */
      ch.consume(queue, (item) => {
        const decodedEnvelope = JSON.parse(item.content);

        const messages = Ably.Realtime.Message.fromEncodedArray(decodedEnvelope.messages);
        messages.forEach(function(message) {
          console.log('worker:', 'Received text:', message.data, '- about to relay the query to chatGPT');
          askAndPublish(responseChannel, message.data, openai);
        });

        /* Remove message from queue */
        ch.ack(item);
      });
    });

    conn.on('error', function(err) { console.error('worker:', 'Connection error!', err); });
  });
};

