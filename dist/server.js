"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const osc_1 = __importDefault(require("osc"));
const utils_1 = require("./utils");
const config_1 = __importDefault(require("./config"));
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const oscServer = yield initOSCUDPServer();
        if (!oscServer) {
            console.log('could not start osc server');
            return;
        }
        initSocketConnection(oscServer, config_1.default.webSocketHost);
    });
}
/**
 * initialize OSC over UDP
 * @returns {Promise<osc.UDPPort>}
 */
function initOSCUDPServer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('attempting to set up osc websocket port');
        const oscServer = new osc_1.default.UDPPort(Object.assign({}, config_1.default.oscOverUDP));
        oscServer.on('ready', () => {
            console.log('Listening for OSC over UDP.');
            const ipAddresses = (0, utils_1.getIPAddresses)();
            ipAddresses.forEach((address) => {
                console.log(' Host:', address + ', Port:', oscServer.options.localPort);
            });
        });
        oscServer.on('message', (oscMessage) => {
            console.log(oscMessage);
        });
        oscServer.on('error', (err) => {
            console.log(err);
        });
        oscServer.open();
        // debug osc messages.
        // setInterval(function () {
        //     var msg = {
        //         address: '/hello/from/oscjs',
        //         args: [
        //             {
        //                 type: 'f',
        //                 key: 'x',
        //                 value: Math.random()
        //             },
        //             {
        //                 type: 'f',
        //                 key: 'y',
        //                 value: Math.random()
        //             }
        //         ]
        //     };
        //     oscServer.send(msg);
        // }, 1000);
        return oscServer;
    });
}
const initSocketConnection = (oscServer, webSocketHost) => {
    console.log('osc setup complete. attempting to connect to : ' + webSocketHost);
    const socket = (0, socket_io_client_1.default)(webSocketHost, { secure: true });
    socket.on('connect', () => {
        console.log('Successfully connected to ' + webSocketHost);
    });
    socket.on('connect_failed', (err) => {
        console.log('connect_failed', err);
    });
    socket.on('error', (err) => {
        console.log('error: ', err);
    });
    socket.on('introduction', (payload) => {
        const msg = {
            address: '/' + payload.client_index + '/',
            args: [
                {
                    type: 's',
                    value: 'connected'
                },
                {
                    type: 's',
                    value: payload.id
                }
            ]
        };
        oscServer.send(msg);
    });
    socket.on('identity-declared', (payload) => {
        const msg = {
            address: '/' + payload.client_index + '/',
            args: [
                {
                    type: 's',
                    value: 'identity-declared'
                },
                {
                    type: 's',
                    value: payload.identity,
                },
                {
                    type: 's',
                    value: payload.id
                }
            ]
        };
        oscServer.send(msg);
    });
    socket.on('onMessage', (payload) => {
        const msgs = handleMessagePayload(payload);
        msgs.map(msg => {
            console.log('sending osc message');
            console.dir(msg, { depth: 2 });
            oscServer.send(msg);
        });
    });
    socket.on('newUserConnected', (payload) => {
        //sending a zero mouse on disconnect.
        oscServer.send(createMessageArgs(payload.client_index, 'Connected', [
            {
                type: 'T'
            }
        ]));
    });
    socket.on('userDisconnected', (payload) => {
        oscServer.send(createMessageArgs(payload.client_index, 'Connected', [
            {
                type: 'F'
            }
        ]));
    });
};
const createMessageArgs = (clientIndex, action, fields) => {
    return {
        address: `/${clientIndex}/${capitalizeFirstChar(action)}`,
        args: fields,
    };
};
const capitalizeFirstChar = (inputString) => {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
};
const handleMessagePayload = (payload) => {
    switch (payload.message) {
        case 'mouseDown':
            return [
                createMessageArgs(payload.client_index, payload.message, [
                    {
                        type: payload.state ? 'T' : 'F'
                    }
                ])
            ];
        case 'button':
            return [
                createMessageArgs(payload.client_index, payload.btnId, [
                    {
                        type: payload.state ? 'T' : 'F'
                    }
                ])
            ];
        case 'paint':
            return [
                createMessageArgs(payload.client_index, `X`, [
                    {
                        type: 'f',
                        value: payload.x,
                    },
                ]),
                createMessageArgs(payload.client_index, `Y`, [
                    {
                        type: 'f',
                        value: 1 - payload.y, //reversed for uv
                    },
                ])
            ];
        default:
            return [
                createMessageArgs(payload.client_index, payload.message, [
                    {
                        type: 's',
                        value: payload.message,
                    },
                ])
            ];
    }
};
init().then(() => {
    console.log('socketosc server started');
}).catch((error) => {
    console.log('socketosc server start error', error);
});
//# sourceMappingURL=server.js.map