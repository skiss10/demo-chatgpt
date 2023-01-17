# [Ably](https://www.ably.io) Ably Reactor Queue and ChatGPT Demo

Ably is a hugely scalable, superfast and secure hosted real-time messaging service for web-enabled devices. [Find out more about Ably](https://www.ably.io).

This demo uses realtime pub/sub to publish queries to chatGPT, and uses the [Ably Reactor Queues](https://www.ably.io/reactor) to subscribe to realtime data from a worker server over AMQP. When the worker receives the query, it sends the request to chatGPT for a response, and publishes the response on a channel so that the browser receives it.

To get this to work for your own accounts:
1) update the server.js file to include your own Ably API Key, OpenAI API Key, and Ably Queue Name. You can get your openai API Key here: https://beta.openai.com/signup. 
2) Create the Ably app on the Ably Dashboard and implement a queue called "openai" and a channel integration rule for your 'chatgpt:query' channel
3) Collect the server endpoint Server endpoint and the Vhost information in the newly created queue and update server.js with that server endpoint and Vhost in the format 'Server endpoint/Vhost'



# Ably Reactor

The Ably Reactor provides Queues to consume realtime data, Events to trigger server-side code or functions in respons to realtime data, and Firehose to stream events to other queue or streaming services.

[Find out more about the Ably Reactor](https://www.ably.io/reactor)
