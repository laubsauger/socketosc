"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIPAddresses = void 0;
const os_1 = __importDefault(require("os"));
const getIPAddresses = () => {
    const interfaces = os_1.default.networkInterfaces();
    const ipAddresses = [];
    if (!interfaces) {
        console.log('No network interfaces reported');
        throw new Error('No network interfaces reported');
    }
    for (let deviceName in interfaces) {
        const addresses = interfaces[deviceName];
        if (!addresses || !addresses.length) {
            console.log('No addresses found for interface', deviceName);
            return [];
        }
        for (let i = 0; i < addresses.length; i++) {
            const addressInfo = addresses[i];
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }
    return ipAddresses;
};
exports.getIPAddresses = getIPAddresses;
//# sourceMappingURL=index.js.map