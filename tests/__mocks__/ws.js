// Mock WebSocket for testing
const { EventEmitter } = require('events');

class MockWebSocket extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.readyState = 0; // CONNECTING initially
    
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.emit('open');
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data) {
    if (this.readyState === 1) {
      // Mock successful send
      return true;
    }
    return false;
  }

  close(code = 1000, reason = '') {
    if (this.readyState === 1 || this.readyState === 0) {
      this.readyState = 3; // CLOSED
      this.emit('close', { code, reason });
      if (this.onclose) this.onclose({ code, reason });
    }
  }

  terminate() {
    this.close(1006, 'Connection terminated');
  }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

// Export as both default and named export to handle different import patterns
module.exports = { 
  WebSocket: MockWebSocket,
  default: MockWebSocket
};
