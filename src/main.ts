const { app, BrowserWindow, dialog, globalShortcut } = require('electron')
const path = require('path')
const pe = require('pluggable-electron/main')

import ipc from './main/ipc'
import i18n from "i18next";
import { mainInit } from './i18n/config'


function createWindow() {

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // contextIsolation: false
    }
  })

  require('@electron/remote/main').initialize()
  require("@electron/remote/main").enable(mainWindow.webContents)

  // and load the index.html of the app.
  mainWindow.loadFile('dist/home.html')
  console.log(app.isPackaged)
  // Open the DevTools.
  if (!app.isPackaged) mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainInit(app.getLocale());
  //Initialise pluggable Electron
  pe.init(
    {
      // Function to check from the main process that user wants to install a plugin
      confirmInstall: async (plugins: any[]) => {
        const answer = await dialog.showMessageBox({
          message: `${i18n.t("Are you sure you want to install the plugin")} ${plugins.join(', ')}`,
          buttons: [i18n.t('Ok'), i18n.t('Cancel')],
          cancelId: 1,
        })
        return answer.response == 0
      },
      // Path to install plugin to
      pluginsPath: path.join(app.getPath('userData'), 'plugins')
    }
  )

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });


  ipc.init();


  // 通过注册快捷键，调开web的开发者模式。 方便调试
  if (!app.isPackaged) globalShortcut.register('CommandOrControl+Shift+L', () => {
    let focusWin = BrowserWindow.getFocusedWindow()
    focusWin?.webContents.toggleDevTools()
  })

})


// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
