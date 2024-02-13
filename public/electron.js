process.env.NODE_OPTIONS = undefined;

const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const SocketOSCServer = require('./server');

let socketOscServerInstance;

function handleSetTitle (event, title) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
}

async function handleServerStart (event, instanceId, localPort, remotePort) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  console.log('handleServerStart', instanceId);

  import('electron-is-dev').then(async (isDev) => {
    socketOscServerInstance = new SocketOSCServer(win, isDev);
    await socketOscServerInstance.init(instanceId, localPort, remotePort);
  })
}

async function handleServerStop (event, message) {
  console.log('handleServerStop', message);
  await socketOscServerInstance.stop();
}


function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 750,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  import('electron-is-dev').then(async (isDev) => {
    win.loadURL(
      isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`
    );

    if (isDev) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  })
}

app.whenReady().then(async () => {
  ipcMain.handle('set-title', handleSetTitle);
  ipcMain.handle('server-start', handleServerStart);
  ipcMain.handle('server-stop', handleServerStop);

  ipcMain.on('toMain', (event, args) => {
    console.log('received from renderer', args)
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

// Logging any exceptions
process.on('uncaughtException', (error) => {
  console.log(`Exception: ${error}`);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});