process.env.NODE_OPTIONS = undefined;
import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import SocketOSCServer from './server.js'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  socketOscServerInstance = new SocketOSCServer(win);
  await socketOscServerInstance.init(instanceId, localPort, remotePort);
}

async function handleServerStop (event, message) {
  console.log('handleServerStop', message);
  await socketOscServerInstance.stop();
}


async function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 750,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  console.log(isDev)

  await win.loadURL(
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