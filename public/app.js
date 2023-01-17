$(function() {
  /* Set up realtime library and authenticate using token issued from server */
  var ably = new Ably.Realtime({ authUrl: '/auth' });
  var responseChannel = ably.channels.get('chatgpt:response');
  var queryChannel = ably.channels.get('chatgpt:query');

  var $output = $('#output'),
      $status = $('#status'),
      $actionButton = $('#action-btn'),
      $text = $('#text');

  /* Subscribe to filtered text published on this channel */
  responseChannel.subscribe(function(message) {
    var $response = $('<p>').text(message.data.resonseText);
    $output.prepend($('<div>').append($response));
  });

  $actionButton.on('click', function() {
    var text = $text.val();
    if (text.replace(' ') != '') {
      /* Publish text to the Ably channel so that the queue worker receives it via queues */
      queryChannel.publish('text', text, function(err) {
        if (err) {
          showStatus('Failed to publish text!');
          $text.val(text);
          return;
        }
        clearStatus();
      });
      showStatus('Sending query...');
      $text.val('');
    }
  });

  ably.connection.on('connecting', function() { showStatus('Connecting to Ably...'); });
  ably.connection.on('connected', function() { clearStatus(); });
  ably.connection.on('disconnected', function() { showStatus('Disconnected from Ably...'); });
  ably.connection.on('suspended', function() { showStatus('Disconnected from Ably for a while...'); });

  function showStatus(text) {
    $status.text(text).show();
  }

  function clearStatus() {
    $status.fadeOut(750);
  }
});
