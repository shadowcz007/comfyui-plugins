const { ipcMain, BrowserWindow } = require('electron')

import server from './server'


const init = (plugins: any) => {
    ipcMain.handle('main:handle', async (event, args) => {
        console.log('main:handle', args)
        const { cmd, data } = args;
        switch (cmd) {

            case 'plugins-list':
                const pluginManager = plugins.getStore();

                const items = pluginManager.getAllPlugins();
                console.log(items)

                return JSON.parse(JSON.stringify(items));

            case 'executeJavaScript':
                const { code } = data;
                let w = BrowserWindow.getFocusedWindow();
                let res = await w?.webContents.executeJavaScript(code);
                console.log('executeJavaScript result', res)
                return {
                    result: res
                }

            case 'server':
                const { isStart,port,path,html } = data;
                if (isStart) {
                    return server.start(port||3000,path,html)
                }else{
                    return server.stop()
                }
                
            default:
                break;

        }



        return true
    });
}

export default { init }