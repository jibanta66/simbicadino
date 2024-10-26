const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline'); // Correct import
const express = require('express'); // Fixed the import statement
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Create an express app
const app = express();

// Serve static files (like your index.html)
app.use(express.static(path.join(__dirname)));

// Create a basic HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = socketIo(server);

// Define the serial port and the parser for reading data
const port = new SerialPort({ 
  path: 'COM5',  // Adjust your COM port as necessary
  baudRate: 9600
}); 
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' })); // Update here

// Send potentiometer data to the front-end via WebSocket
parser.on('data', (data) => {
  console.log(`Potentiometer Value: ${data}`);
  io.emit('potentiometer-data', data.trim()); // Trim to remove whitespace or newlines
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Client connected');
});

// Set server to listen on port 3000
server.listen(3000, () => {
  console.log('Listening on port 3000');
});
