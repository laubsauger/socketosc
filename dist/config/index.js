"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    // webSocketHost: 'http://localhost:8080',
    // webSocketHost: 'http://192.168.1.101:8080',
    webSocketHost: 'http://147.182.251.185:8080',
    oscOverUDP: {
        // remoteAddress: '192.168.1.255',
        // remotePort: 57121,
        localAddress: '0.0.0.0',
        localPort: 57121,
        metadata: true,
        // broadcast: true,
        // multicastMembership: '192.168.1.255:57121',
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map