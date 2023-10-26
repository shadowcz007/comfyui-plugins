const { ipcMain, BrowserWindow, app } = require('electron')
const path = require('path');
const fs = require('fs-extra');

import server from './server'

const pluginsPaths = path.join(app.getPath('userData'), 'plugins');

// 遍历文件夹下的文件
function traverseDirectory(dir: any) {
    // 读取目录下的所有文件和文件夹
    fs.readdir(dir, (err: any, files: any[]) => {
        if (err) {
            console.error(err);
            return;
        }

        // 遍历文件和文件夹
        files.forEach((file) => {
            // 获取文件/文件夹的完整路径
            const filePath = path.join(dir, file);

            // 检查文件状态
            fs.stat(filePath, (err: any, stats: { isDirectory: () => any; }) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // 如果是文件夹，则递归调用traverseDirectory函数
                if (stats.isDirectory()) {
                    traverseDirectory(filePath);
                } else {
                    // 如果是文件，则打印文件路径
                    console.log(filePath);
                }
            });
        });
    });
}


const getMoreInfo = () => {
    let info: any = {};
    const data = fs.readFileSync(path.join(pluginsPaths, 'plugins.json'), 'utf8');
    let items = JSON.parse(data);
    for (const key in items) {
        const item = JSON.parse(fs.readFileSync(path.join(pluginsPaths, key, 'package.json'), 'utf8'));
        info[key] = item;
        console.log(path.join(pluginsPaths, key, 'avatar.png'),
            fs.existsSync(path.join(pluginsPaths, key, 'avatar.png')))
        if (fs.existsSync(path.join(pluginsPaths, key, 'avatar.png'))) {
            info[key].avatar = path.join(pluginsPaths, key, 'avatar.png');
        }

    }
    return info
}

const init = (plugins: any) => {
    ipcMain.handle('main:handle', async (event, args) => {
        console.log('main:handle', args)
        const { cmd, data } = args;
        switch (cmd) {

            case 'plugins-list':
                const pluginManager = plugins.getStore();

                const items = pluginManager.getAllPlugins();
                const info = getMoreInfo()

                // console.log(items)

                let itemsNew = [];
                for (const item of JSON.parse(JSON.stringify(items))) {
                    if (info[item.name]) itemsNew.push({
                        ...item,
                        avatar: info[item.name].avatar,
                        info: info[item.name]
                    })
                }
                return itemsNew;

            case 'executeJavaScript':
                const { code } = data;
                let w = BrowserWindow.getFocusedWindow();
                let res = await w?.webContents.executeJavaScript(code);
                console.log('executeJavaScript result', res)
                return {
                    result: res
                }

            case 'server':
                const { isStart, port, path, html } = data;
                if (isStart) {
                    return server.start(port || 3000, path, html)
                } else {
                    return server.stop()
                }

            default:
                break;

        }



        return true
    });
}

export default { init }