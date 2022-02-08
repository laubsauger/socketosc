const config = {
  // webSocketHost: 'http://localhost:8080',
  // webSocketHost: 'http://socket.osc.link',
  // webSocketHost: 'http://147.182.251.185',
  webSocketHost: 'https://socket.osc.link',
  oscOverUDP: {
    localAddress: '0.0.0.0',
    localPort: 57121,
    metadata: true,
  },
};

export default config;