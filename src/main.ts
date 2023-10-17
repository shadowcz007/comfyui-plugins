const { app, BrowserWindow, dialog,screen, globalShortcut } = require('electron')
const path = require('path')
const pe = require('pluggable-electron/main')

import ipc from './main/ipc'
import i18n from "i18next";
import { mainInit } from './i18n/config'
const isDebug = !!(process?.env.npm_lifecycle_script?.match("--DEV"));

function createWindow() {
  const vw = screen.getPrimaryDisplay().workAreaSize.width;
  const vh = screen.getPrimaryDisplay().workAreaSize.height;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: 0, y: 0,
    width: vw,
    height: vh,
    type: 'toolbar',  //创建的窗口类型为工具栏窗口
    frame: false,  //要创建无边框窗口
    resizable: false,
    show: true,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
      sandbox: false,
      // navigateOnDragDrop: true, //支持直接拖文件进来
      autoplayPolicy: 'user-gesture-required',
      spellcheck: false
    }
    
  })

  require('@electron/remote/main').initialize()
  require("@electron/remote/main").enable(mainWindow.webContents);

  // ipc监听
  ipc.init(pe);

  // and load the index.html of the app.
  mainWindow.loadFile('dist/home.html');
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // Open the DevTools.
  if (isDebug) setTimeout(() => mainWindow.webContents.openDevTools({mode:'detach' }), 2000)


  // 通过注册快捷键，调开web的开发者模式。 方便调试
  if (isDebug) globalShortcut.register('CommandOrControl+Shift+L', () => {
    mainWindow?.webContents.toggleDevTools()
  })

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




})


// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
