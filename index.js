const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const { updateVersion } = require('./upgrade')

let win
function createWindow() {

  win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      webSecurity: false
    }
  })

  Menu.setApplicationMenu(null)

  // win.webContents.openDevTools()

  win.loadURL(url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('closed', () => {
    win = null
  })

  updateVersion()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

