import { contextBridge, ipcRenderer, clipboard, IpcRendererEvent, nativeImage, webFrame, BrowserWindow } from 'electron';

const remote = require("@electron/remote")

const useFacade = require("pluggable-electron/facade")
useFacade()


export type Channels = 'ipc-plugins';


// const currentWindow = remote.getCurrentWindow();
// console.log(remote.BrowserWindow.getFocusedWindow())


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
    }
};

contextBridge.exposeInMainWorld('electron', electronHandler);
export type ElectronHandler = typeof electronHandler;
