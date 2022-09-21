process.env.NODE_OPTIONS = undefined;

const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const SocketOSCServer = require('./server');

function handleSetTitle (event, title) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
}

async function handleServerStart (event, instanceId) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);

  console.log('handleServerStart', instanceId);
  const server = new SocketOSCServer(win);
  await server.init(instanceId);
}

async function handleServerStop (event, message) {
  console.log('handleServerStop', message);
  //@todo: close socketosc / oscudp whatever stuffs
}


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(async () => {
  ipcMain.handle('set-title', handleSetTitle);
  ipcMain.handle('server-start', handleServerStart);
  ipcMain.handle('server-stop', handleServerStop);

  ipcMain.on('toMain', (event, args) => {
    console.log('received from renderer', args)
    // const webContents = event.sender;
    // const win = BrowserWindow.fromWebContents(webContents);
    // win.webContents.send('fromMain', { EPIC: 'RESPONSE'});
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