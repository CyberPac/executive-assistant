// Mock WebSocket for testing
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    setTimeout(() => {
      this.onopen && this.onopen();
    }, 0);
  }

  send(data) {
    // Mock send implementation
  }

  close() {
    this.readyState = 3; // CLOSED
    this.onclose && this.onclose();
  }
}

MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

module.exports = MockWebSocket;
