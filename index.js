const WebSocket = require('ws');
const http = require('http');

// Create an array to store connected clients
const clients = [];

// Create HTTP server for REST endpoint
const restServer = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/push') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      // Send the received payload to all connected clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(body);
        }
      });
      
      res.statusCode = 200;
      res.end('Message sent to all connected clients');
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// Create WebSocket server
const wsServer = http.createServer();
const wss = new WebSocket.Server({ server: wsServer });

// Event listener for when a client connects
wss.on('connection', function connection(ws) {
    console.log('Client connected');
    
    // Add client to the array
    clients.push(ws);

    // Event listener for when a message is received from a client
    ws.on('message', function incoming(message) {
        console.log('Received: %s', message);
        
        // Echo the message back to the client
        ws.send(message.toString());
    });

    // Event listener for when a client disconnects
    ws.on('close', function close() {
        console.log('Client disconnected');
        
        // Remove client from the array
        const index = clients.indexOf(ws);
        if (index !== -1) {
            clients.splice(index, 1);
        }
    });

    // Send a welcome message to the client
    ws.send('Welcome to the WebSocket server!');
});

// Start the REST server
restServer.listen(9099, () => {
    console.log('REST server started on port 9099');
});

// Start the WebSocket server
wsServer.listen(9098, () => {
    console.log('WebSocket server started on port 9098');
});