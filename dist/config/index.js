"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    webSocketHost: process.env.NODE_ENV === 'production' ? 'https://socket.osc.link' : 'http://localhost:8080',
    socketRoom: 'control',
    oscOverUDP: {
        localAddress: '127.0.0.1',
        localPort: 57121,
        metadata: true,
    },
};
console.log(process.env.NODE_ENV);
exports.default = config;
//# sourceMappingURL=index.js.map