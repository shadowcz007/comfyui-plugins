const { ipcMain, BrowserWindow } = require('electron')

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
                console.log('executeJavaScript result',res)
                return {
                    result: res
                }
            default:
                break;

        }



        return true
    });
}

export default { init }