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
    console.log('osc setup complete. attempting to connect to: ' + webSocketHost);
    const socket = (0, socket_io_client_1.default)(webSocketHost, {
        secure: true,
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionAttempts: 5,
    });
    socket.on('connect', () => {
        console.log('Successfully connected to ' + webSocketHost);
        console.log('Request join to control room...', config_1.default.socketRoom);
        socket.emit('OSC_JOIN_REQUEST', config_1.default.socketRoom);
    });
    socket.on('disconnect', (reason) => {
        console.log('!! Disconnected from ' + webSocketHost);
        console.log(reason);
        // disconnect initiated by the server, reconnect manually
        if (reason === 'io server disconnect') {
            socket.connect();
        }
    });
    socket.on('OSC_JOIN_ACCEPTED', (data) => {
        console.log('OSC_JOIN_ACCEPTED', config_1.default.socketRoom, data);
    });
    socket.on('OSC_JOIN_REJECTED', (data) => {
        console.log('OSC_JOIN_REJECTED', config_1.default.socketRoom, data);
    });
    socket.on('OSC_JOINED', (data) => {
        console.log('OSC_JOINED', config_1.default.socketRoom, data);
    });
    socket.on('OSC_CTRL_MESSAGE', (payload) => {
        console.log('OSC_CTRL_MESSAGE', payload);
        const msgs = handleMessagePayload(payload);
        console.log('MESSAGES', msgs.length);
        msgs.map(msg => {
            console.log('sending osc message');
            console.dir(msg, { depth: 2 });
            oscServer.send(msg);
        });
    });
    socket.on('OSC_CTRL_USER_JOINED', (payload) => {
        console.log('OSC_CTRL_USER_JOINED', payload);
        oscServer.send(createMessageArgs(payload.client_index, 'Connected', [{ type: 'T' }]));
    });
    socket.on('OSC_CTRL_USER_LEFT', (payload) => {
        console.log('OSC_CTRL_USER_LEFT', payload);
        oscServer.send(createMessageArgs(payload.client_index, 'Connected', [{ type: 'F' }]));
    });
    socket.on('DISCO_DIFFUSION_PROMPT', (payload) => {
        console.log('DISCO_DIFFUSION_PROMPT', payload);
        const msg = handleMessagePayload(Object.assign(Object.assign({}, payload), { message: 'discoDiffusion' }));
        oscServer.send(msg[0]);
    });
    socket.on('reconnect_attempt', (data) => {
        console.log('reconnect_attempt', data);
    });
    socket.on('reconnect', (data) => {
        console.log('reconnect', data);
    });
    socket.on('connect_failed', (err) => {
        console.log('connect_failed', err);
    });
    socket.on('error', (err) => {
        console.log('error: ', err);
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
        case 'discoDiffusion':
            return [
                createMessageArgs(1, 'disco', [
                    {
                        type: 's',
                        value: payload.text,
                    },
                    {
                        type: 's',
                        value: payload.imageURL,
                    },
                    {
                        type: 's',
                        value: payload.email,
                    },
                    {
                        type: 's',
                        value: payload.name,
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
    // console.log('socketosc server started');
}).catch((error) => {
    console.log('socketosc server start error', error);
});
//# sourceMappingURL=server.js.map