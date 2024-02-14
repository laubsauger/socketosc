const { contextBridge, ipcRenderer } = require('electron');

window.ipcRenderer = require('electron').ipcRenderer;

let currentChannelReceiverListener;
let validChannels = [ 'pushLog', 'pushInfo', 'pushActivity' ];

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.invoke('set-title', title),
  serverStart: (instanceId, localPort, remotePort) => ipcRenderer.invoke('server-start', instanceId, localPort, remotePort),
  serverStop: (instanceId) => ipcRenderer.invoke('server-stop', instanceId),
  // serverLog: (message) => ipcRenderer.invoke('server-log', message),
  send: (channel, data) => {
    // whitelist channels
    // let validChannels = [ 'toMain' ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    if (!validChannels.includes(channel)) {
      return;
    }

    // Deliberately strip event as it includes `sender`
    // ipcRenderer.on(channel, (event, ...args) => func(...args));
    currentChannelReceiverListener = (event, ...args) => func(...args);
    ipcRenderer.on(channel, currentChannelReceiverListener);
  },
  stopReceive: (channel) => {
    if (!validChannels.includes(channel)) {
      return;
    }

    if (currentChannelReceiverListener) {
      ipcRenderer.removeListener(channel, currentChannelReceiverListener);
    }
  },
});