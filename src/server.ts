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
  console.log('osc setup complete. attempting to connect to : ' + webSocketHost);

  const socket = io(webSocketHost, {secure: true});

  socket.on('connect', () => {
    console.log('Successfully connected to ' + webSocketHost);
  });

  socket.on('connect_failed', (err:any) => {
    console.log('connect_failed', err);
  });

  socket.on('error', (err:any) => {
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
      console.dir(msg, { depth: 2 })
      oscServer.send(msg);
    })
  });

  socket.on('newUserConnected', (payload) => {
    //sending a zero mouse on disconnect.
    oscServer.send(createMessageArgs(
      payload.client_index,
      'Connected',
      [
        {
          type: 'T'
        }
      ]
    ));
  });

  socket.on('userDisconnected', (payload) => {
    oscServer.send(createMessageArgs(
      payload.client_index,
      'Connected',
      [
        {
          type: 'F'
        }
      ]
    ));
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
  console.log('socketosc server started');
}).catch((error) => {
  console.log('socketosc server start error', error);
});