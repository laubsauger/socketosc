const config = (isDev) => ({
  webSocketHost: !isDev ? 'https://socket.osc.link' : 'http://localhost:8080',
  socketRoomPrefix: 'control',
  oscOverUDP: {
    localAddress: '0.0.0.0',
    localPort: 56121,
    remotePort: 57121,
    metadata: true,
  },
});

module.exports = config;