/**
 * Mock for ws (WebSocket) - fixes native dependency issues
 */

const { EventEmitter } = require('events');

// Mock WebSocket class
class MockWebSocket extends EventEmitter {
  constructor(address, options) {
    super();
    this.url = address;
    this.readyState = MockWebSocket.CONNECTING;
    this.bufferedAmount = 0;
    this.extensions = '';
    this.protocol = '';
    this.binaryType = 'nodebuffer';

    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.emit('open');
    }, 10);
  }

  send(data) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // Simulate message echo for testing
    setTimeout(() => {
      this.emit('message', data);
    }, 5);
  }

  close(code, reason) {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.emit('close', code || 1000, reason || '');
    }, 5);
  }

  ping(data) {
    setTimeout(() => {
      this.emit('pong', data);
    }, 5);
  }

  pong(data) {
    // Mock pong implementation
  }

  terminate() {
    this.readyState = MockWebSocket.CLOSED;
    this.emit('close', 1006, 'Connection terminated');
  }
}

// WebSocket ready states
MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

// Mock WebSocket Server
class MockWebSocketServer extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {};
    this.clients = new Set();
    
    // Simulate server start
    setTimeout(() => {
      this.emit('listening');
    }, 10);
  }

  close(callback) {
    this.clients.clear();
    if (callback) {
      setTimeout(callback, 5);
    }
    this.emit('close');
  }

  handleUpgrade(request, socket, head, callback) {
    const ws = new MockWebSocket();
    this.clients.add(ws);
    ws.on('close', () => {
      this.clients.delete(ws);
    });
    callback(ws);
  }

  shouldHandle(request) {
    return true;
  }
}

// Mock createWebSocketStream function
const createWebSocketStream = (ws, options) => {
  const { Duplex } = require('stream');
  return new Duplex({
    write(chunk, encoding, callback) {
      ws.send(chunk);
      callback();
    },
    read() {
      // Mock read implementation
    }
  });
};

module.exports = MockWebSocket;
module.exports.WebSocket = MockWebSocket;
module.exports.WebSocketServer = MockWebSocketServer;
module.exports.Server = MockWebSocketServer;
module.exports.createWebSocketStream = createWebSocketStream;
module.exports.default = MockWebSocket;