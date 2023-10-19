import { contextBridge, ipcRenderer, clipboard, IpcRendererEvent, nativeImage, webFrame, BrowserWindow } from 'electron';

const remote = require("@electron/remote")

const useFacade = require("pluggable-electron/facade")
useFacade();




const isDebug = !!(process?.env.npm_lifecycle_script?.match("--DEV"));

export type Channels = 'ipc-plugins';


let win = remote.getCurrentWindow();
window.addEventListener("mousemove", (event: any) => {
    console.log(event?.target.nodeName)
    if (!['HTML', 'DIV'].includes(event.target.nodeName)) {
        win.setIgnoreMouseEvents(false);
    } else {
        win.setIgnoreMouseEvents(true, { forward: true });
    }
})

const electronHandler = {
    ipcRenderer: {
        send(channel: Channels, args: unknown[]) {
            ipcRenderer.send(channel, args);
        },
        on(channel: Channels, func: (...args: unknown[]) => void) {
            const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => {
                return func(...args)
            };

            ipcRenderer.on(channel, subscription);

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        },
        once(channel: Channels, func: (...args: unknown[]) => void) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
        invoke(channel: Channels, args: unknown[]) {
            return ipcRenderer.invoke(channel, args);
        },
    },
    getPluginsList: () => ipcRenderer.invoke('main:handle', { cmd: 'plugins-list' }),
    plugins: () => {

        return require('pluggable-electron/renderer')
    },
    getCurrentWindow: () => remote.BrowserWindow.getFocusedWindow(),
    openInstallFile: () => {
        let w: any = remote.BrowserWindow.getFocusedWindow();
        const filepath: string = remote.dialog.showOpenDialogSync(w, {
            title: '保存',
            // defaultPath: Index.databasePath + filename,
            properties: ['openFile'],
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        }) || '';
        return filepath
    },
    isDebug,
    platform: process.platform,
    executeJavaScript: (code: string) => {
        return ipcRenderer.invoke('main:handle', { cmd: "executeJavaScript", data: { code: code } })
    }
};

contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;
