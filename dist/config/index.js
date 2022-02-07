"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    // webSocketHost: 'http://localhost:8080',
    webSocketHost: 'http://192.168.1.85:8080',
    oscOverUDP: {
        // remoteAddress: '192.168.1.85',
        // remotePort: 57121,
        localAddress: '0.0.0.0',
        localPort: 57121,
        metadata: true,
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map