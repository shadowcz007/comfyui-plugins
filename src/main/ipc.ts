const { ipcMain } = require('electron')

const init = (plugins:any) => {
    ipcMain.handle('main:handle', (args) => {
        console.log('main:handle', args)
        const u=plugins.getStore()
        return u;
    });
}

export default { init }