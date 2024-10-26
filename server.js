const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
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

// Function to initialize the serial port
async function initializeSerialPort() {
  try {
    // List all connected serial ports
    const ports = await SerialPort.list();
    
    // Check if there are any available ports
    if (ports.length === 0) {
      console.error('No COM ports available.');
      return;
    }

    // Use the first available port (you can modify this logic as needed)
    const selectedPort = ports[0].path;
    console.log(`Using COM port: ${selectedPort}`);

    // Create the serial port and parser
    const port = new SerialPort({ 
      path: selectedPort,
      baudRate: 9600
    });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    // Send potentiometer data to the front-end via WebSocket
    parser.on('data', (data) => {
      console.log(`Potentiometer Value: ${data}`);
      io.emit('potentiometer-data', data.trim());
    });
  } catch (error) {
    console.error('Error initializing serial port:', error);
  }
}

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Client connected');
});

// Initialize the serial port
initializeSerialPort();

// Set server to listen on port 3000
server.listen(3000, () => {
  console.log('Listening on port 3000');
});
