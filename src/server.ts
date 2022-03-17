import io from 'socket.io-client';
import osc from 'osc';
import { getIPAddresses } from './utils';
import config from './config';

async function init() {
  const oscServer = await initOSCUDPServer();

  if (!oscServer) {
    console.log('could not start osc server');
    return;
  }

  initSocketConnection(oscServer, config.webSocketHost);
}

/**
 * initialize OSC over UDP
 * @returns {Promise<osc.UDPPort>}
 */
async function initOSCUDPServer() {
  console.log('attempting to set up osc websocket port');

  const oscServer = new osc.UDPPort({
    ...config.oscOverUDP
  });

  oscServer.on('ready', () => {
    console.log('Listening for OSC over UDP.');

    const ipAddresses = getIPAddresses();
    ipAddresses.forEach((address) => {
      console.log(' Host:', address + ', Port:', oscServer.options.localPort);
    });
  });

  oscServer.on('message', (oscMessage:{}) => {
    console.log(oscMessage);
  });

  oscServer.on('error', (err:{}) => {
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
}

const initSocketConnection = (oscServer:osc.UDPPort, webSocketHost:string) => {
  console.log('osc setup complete. attempting to connect to: ' + webSocketHost);

  const socket = io(webSocketHost, {
    secure: true,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Successfully connected to ' + webSocketHost);

    console.log('Joining room', config.socketRoom)
    socket.emit('OSC_JOIN_REQUEST', config.socketRoom);
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
    console.log('OSC_JOIN_ACCEPTED', config.socketRoom, data);
  });

  socket.on('OSC_JOIN_REJECTED', (data) => {
    console.log('OSC_JOIN_REJECTED', config.socketRoom, data);
  });

  socket.on('OSC_JOINED', (data) => {
    console.log('OSC_JOINED', config.socketRoom, data);
  });

  socket.on('OSC_CTRL_MESSAGE', (payload) => {
    console.log('OSC_CTRL_MESSAGE', payload);
    const msgs = handleMessagePayload(payload);

    console.log('MESSAGES', msgs.length);

    msgs.map(msg => {
      console.log('sending osc message');
      console.dir(msg, { depth: 2 })
      oscServer.send(msg);
    })
  });

  socket.on('OSC_CTRL_USER_JOINED', (payload) => {
    console.log('OSC_CTRL_USER_JOINED', payload);
    oscServer.send(createMessageArgs(
      payload.client_index,
      'Connected',
      [{ type: 'T' }],
    ));
  });

  socket.on('OSC_CTRL_USER_LEFT', (payload) => {
    console.log('OSC_CTRL_USER_LEFT', payload);
    oscServer.send(createMessageArgs(
      payload.client_index,
      'Connected',
      [{ type: 'F' }]
    ));
  });

  socket.on('DISCO_DIFFUSION_PROMPT', (payload) => {
    console.log('DISCO_DIFFUSION_PROMPT', payload);
    const msg = handleMessagePayload({ ...payload, message: 'discoDiffusion' });

    oscServer.send(msg[0]);
  });

  socket.on('reconnect_attempt', (data) => {
    console.log('reconnect_attempt', data);
  });

  socket.on('reconnect', (data) => {
    console.log('reconnect', data);
  });

  socket.on('connect_failed', (err:any) => {
    console.log('connect_failed', err);
  });

  socket.on('error', (err:any) => {
    console.log('error: ', err);
  });
};


const createMessageArgs = (clientIndex:number, action:string, fields:any) => {
  return {
    address: `/${clientIndex}/${capitalizeFirstChar(action)}`,
    args: fields,
  }
}

const capitalizeFirstChar = (inputString:string) => {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
}

const handleMessagePayload = (payload:any) => {
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

init().then(() => {
  // console.log('socketosc server started');
}).catch((error) => {
  console.log('socketosc server start error', error);
});