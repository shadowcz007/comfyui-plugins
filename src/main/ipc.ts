const { ipcMain } = require('electron')

const init = (plugins: any) => {
    ipcMain.handle('main:handle', (event, args) => {
        console.log('main:handle', args)
        const { cmd, data } = args;
        switch (cmd) {

            case 'plugins-list':
                const pluginManager = plugins.getStore();
                
                const items=pluginManager.getAllPlugins();
                console.log(items)
                
                return JSON.parse(JSON.stringify(items));

            default:
                break;

        }



        return true
    });
}

export default { init }