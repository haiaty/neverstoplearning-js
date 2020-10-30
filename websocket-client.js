/*

npm install ws --save
*/

const WebSocket = require('ws');

const ws = new WebSocket('ws:localhost:8008/subscriptions');

ws.on('open', function open() {
    ws.send(JSON.stringify({
        'action': 'subscribe',
        'address_prefixes': ['bdc210']
      }))
  });
  
  ws.on('message', function incoming(data) {
    console.log(data);
  });
