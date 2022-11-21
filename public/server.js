const io = require('socket.io-client');
const os = require('os');
const osc = require('osc');
const config = require('./config');

class SocketOSCServer {
  electronWindow;
  oscServer;
  socket;
  sessionState = {
    usedSlots: 0,
  };

  constructor(electronWindow) {
    this.electronWindow = electronWindow;
  }

  log(message) {
    console.log(message);

    if (this.electronWindow) {
      this.electronWindow.webContents.send('pushLog', message);
    }
  }

  pushSessionState(update) {
    console.log(this.sessionState, update);

    this.sessionState = {
      ...this.sessionState,
      ...update,
    };

    if (this.electronWindow) {
      this.electronWindow.webContents.send('pushInfo', this.sessionState);
    }
  }

  async init(instanceId, localPort=false, remotePort=false) {
    const localUDPPort = localPort ? localPort : config.oscOverUDP.localPort;
    const remoteUDPPort = remotePort ? remotePort : config.oscOverUDP.remotePort;

    this.log(`${instanceId} at port ${localUDPPort} | remotePort: ${remoteUDPPort}`);

    this.oscServer = await this.initOSCUDPServer({
      ...config.oscOverUDP,
      localPort: localUDPPort,
      remotePort: remoteUDPPort,
    });

    if (!this.oscServer) {
      this.log('could not start osc server');
      return;
    }

    this.log(`Started OSCUDP server. Listening to instance: ${instanceId} at port ${localUDPPort} | remotePort: ${remoteUDPPort}`);

    const room = `${config.socketRoomPrefix}:${instanceId}`;
    this.initSocketConnection(this.oscServer, config.webSocketHost, room);
  }

  async stop() {
    console.log(this.oscServer);
    this.oscServer.close();

    console.log(this.oscServer);
    this.socket.close();
  }

  /**
   * initialize OSC over UDP
   * @params config {{}}
   * @returns {Promise<osc.UDPPort>}
   */
  async initOSCUDPServer(config) {
    this.log('attempting to set up osc websocket port');

    const oscServer = new osc.UDPPort(config);

    this.log(`Sending OSC data to remote port: ${config.remotePort}`);

    oscServer.on('ready', () => {
      this.log('Listening for incoming OSC on...');

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

    this.socket = io(webSocketHost, {
      secure: true,
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.log('Successfully connected to ' + webSocketHost);
      // this.log('Request join to control room: ' + room);

      this.socket.emit('OSC_JOIN_REQUEST', room);
    });

    this.socket.on('disconnect', (reason) => {
      this.log('!! Disconnected from ' + webSocketHost);
      console.log(reason);

      // disconnect initiated by the server, reconnect manually
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('OSC_JOIN_ACCEPTED', (data) => {
      console.log('OSC_JOIN_ACCEPTED', room, data);
      this.pushSessionState(data);
    });

    this.socket.on('OSC_JOIN_REJECTED', (data) => {
      console.log('OSC_JOIN_REJECTED', room, data);
    });

    this.socket.on('OSC_JOINED', (data) => {
      console.log('OSC_JOINED', room, data);
    });

    this.socket.on('OSC_CTRL_MESSAGE', (payload) => {
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

    this.socket.on('OSC_CTRL_USER_JOINED', (payload) => {
      this.log('OSC_CTRL_USER_JOINED ' + payload.client_index);
      // console.log('OSC_CTRL_USER_JOINED', payload);
      oscServer.send(createMessageArgs(
        payload.client_index,
        'Connected',
        [{
          type: 'i',
          value: 1
        }]
      ));

      this.pushSessionState({ usedSlots: payload.usedSlots });
    });

    this.socket.on('OSC_CTRL_USER_LEFT', (payload) => {
      // console.log('OSC_CTRL_USER_LEFT', payload);
      this.log('OSC_CTRL_USER_LEFT ' + payload.client_index);

      oscServer.send(createMessageArgs(
        payload.client_index,
        'Connected',
        [{
          type: 'i',
          value: 0
        }]
      ));

      this.pushSessionState({ usedSlots: payload.usedSlots });
    });

    // socket.on('DISCO_DIFFUSION_PROMPT', (payload) => {
    //   console.log('DISCO_DIFFUSION_PROMPT', payload);
    //   const msg = this.handleMessagePayload({ ...payload, message: 'discoDiffusion' });
    //
    //   oscServer.send(msg[0]);
    // });

    this.socket.on('reconnect_attempt', (data) => {
      console.log('reconnect_attempt', data);
    });

    this.socket.on('reconnect', (data) => {
      console.log('reconnect', data);
    });

    this.socket.on('connect_failed', (err) => {
      console.log('connect_failed', err);
    });

    this.socket.on('error', (err) => {
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
                type: 'i',
                value: payload.state ? 1 : 0
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
                type: 'i',
                value: payload.state ? 1 : 0
              }
            ]
          )
        ];
      case 'fader':
        return [
          createMessageArgs(
            payload.client_index,
            payload.id,
            [
              {
                type: 'i',
                value: payload.state
              }
            ]
          )
        ];
      case 'motion':
        return [
          createMessageArgs(
            payload.client_index,
            `x_acc`,
            [
              {
                type: 'i',
                value: payload.x,
              },
            ]
          ),
          createMessageArgs(
            payload.client_index,
            `y_acc`,
            [
              {
                type: 'i',
                value: payload.y
              },
            ]
          ),
          createMessageArgs(
            payload.client_index,
            `z_acc`,
            [
              {
                type: 'i',
                value: payload.z
              },
            ]
          ),
          createMessageArgs(
            payload.client_index,
            `x_rot`,
            [
              {
                type: 'i',
                value: payload.rotation.alpha,
              },
            ]
          ),
          createMessageArgs(
            payload.client_index,
            `y_rot`,
            [
              {
                type: 'i',
                value: payload.rotation.beta,
              },
            ]
          ),
          createMessageArgs(
            payload.client_index,
            `z_rot`,
            [
              {
                type: 'i',
                value: payload.rotation.gamma,
              },
            ]
          ),
        ]
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