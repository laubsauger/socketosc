const io = require('socket.io-client');
const os = require('os');
const osc = require('osc');
const config = require('./config');

class SocketOSCServer {
  electronWindow;

  constructor(electronWindow) {
    this.electronWindow = electronWindow;
  }

  log(message) {
    console.log(message);

    if (this.electronWindow) {
      this.electronWindow.webContents.send('fromMain', message);
    }
  }

  async init(instanceId) {
    const oscServer = await this.initOSCUDPServer();

    if (!oscServer) {
      this.log('could not start osc server');
      return;
    }

    this.log(`Started OSCUDP server. Listening to instance: ${instanceId}`);

    const room = `${config.socketRoomPrefix}:${instanceId}`;
    this.initSocketConnection(oscServer, config.webSocketHost, room);
  }

  /**
   * initialize OSC over UDP
   * @returns {Promise<osc.UDPPort>}
   */
  async initOSCUDPServer() {
    this.log('attempting to set up osc websocket port');

    const oscServer = new osc.UDPPort({
      ...config.oscOverUDP
    });

    oscServer.on('ready', () => {
      this.log('Listening for OSC over UDP.');

      const ipAddresses = getIPAddresses();

      ipAddresses.forEach((address) => {
        this.log('Host: ' + address + ', Port: ' + oscServer.options.localPort);
      });
    });

    oscServer.on('message', (oscMessage) => {
      this.log(oscMessage);
    });

    oscServer.on('error', (err) => {
      this.log(err);
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
  }

  initSocketConnection(oscServer, webSocketHost, room) {
    this.log('osc setup complete. attempting to connect to: ' + webSocketHost);

    const socket = io(webSocketHost, {
      secure: true,
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      this.log('Successfully connected to ' + webSocketHost);
      // this.log('Request join to control room: ' + room);

      socket.emit('OSC_JOIN_REQUEST', room);
    });

    socket.on('disconnect', (reason) => {
      this.log('!! Disconnected from ' + webSocketHost);
      console.log(reason);

      // disconnect initiated by the server, reconnect manually
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('OSC_JOIN_ACCEPTED', (data) => {
      console.log('OSC_JOIN_ACCEPTED', room, data);
      // this.log('OSC_JOIN_ACCEPTED ' + room);
    });

    socket.on('OSC_JOIN_REJECTED', (data) => {
      console.log('OSC_JOIN_REJECTED', room, data);
    });

    socket.on('OSC_JOINED', (data) => {
      console.log('OSC_JOINED', room, data);
    });

    socket.on('OSC_CTRL_MESSAGE', (payload) => {
      this.log('OSC_CTRL_MESSAGE ' + JSON.stringify(payload));
      // console.log('OSC_CTRL_MESSAGE', payload);
      const msgs = this.handleMessagePayload(payload);

      // console.log('MESSAGES', msgs.length);

      msgs.map(msg => {
        console.log('sending osc message');
        console.dir(msg, { depth: 2 })
        oscServer.send(msg);
      })
    });

    socket.on('OSC_CTRL_USER_JOINED', (payload) => {
      this.log('OSC_CTRL_USER_JOINED ' + payload.client_index);
      // console.log('OSC_CTRL_USER_JOINED', payload);
      oscServer.send(createMessageArgs(
        payload.client_index,
        'Connected',
        [{ type: 'T' }],
      ));
    });

    socket.on('OSC_CTRL_USER_LEFT', (payload) => {
      // console.log('OSC_CTRL_USER_LEFT', payload);
      this.log('OSC_CTRL_USER_LEFT ' + payload.client_index);
      oscServer.send(createMessageArgs(
        payload.client_index,
        'Connected',
        [{ type: 'F' }]
      ));
    });

    // socket.on('DISCO_DIFFUSION_PROMPT', (payload) => {
    //   console.log('DISCO_DIFFUSION_PROMPT', payload);
    //   const msg = this.handleMessagePayload({ ...payload, message: 'discoDiffusion' });
    //
    //   oscServer.send(msg[0]);
    // });

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

  handleMessagePayload(payload) {
    switch (payload.message) {
      case 'mouseDown':
        return [
          createMessageArgs(
            payload.client_index,
            payload.message,
            [
              {
                type: payload.state ? 'T' : 'F'
              }
            ]
          )
        ];
      case 'button':
        return [
          createMessageArgs(
            payload.client_index,
            payload.btnId,
            [
              {
                type: payload.state ? 'T' : 'F'
              }
            ]
          )
        ];
      case 'paint':
        return [
          createMessageArgs(
            payload.client_index,
            `X`,
            [
              {
                type: 'f',
                value: payload.x,
              },
            ]
          ),
          createMessageArgs(
            payload.client_index,
            `Y`,
            [
              {
                type: 'f',
                value: 1 - payload.y, //reversed for uv
              },
            ]
          )
        ]
      case 'discoDiffusion':
        return [
          createMessageArgs(
            1,
            'disco',
            [
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
            ]
          )
        ]
      case 'textPrompt':
        return [
          createMessageArgs(
            payload.client_index,
            'text',
            [
              {
                type: 's',
                value: payload.text,
              }
            ]
          )
        ]
      default:
        return [
          createMessageArgs(
            payload.client_index,
            payload.message,
            [
              {
                type: 's',
                value: payload.message,
              },
            ]
          )
        ];
    }
  };
}

const getIPAddresses = () => {
  const interfaces = os.networkInterfaces();
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
}

const createMessageArgs = (clientIndex, action, fields) => {
  return {
    address: `/${clientIndex}/${capitalizeFirstChar(action)}`,
    args: fields,
  }
}

const capitalizeFirstChar = (inputString) => {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
}

module.exports = SocketOSCServer;