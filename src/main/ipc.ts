const { ipcMain, BrowserWindow, app, dialog } = require('electron')
const path = require('path')
// const sharp = require('sharp');
const fs = require('fs-extra')
const hash = require('object-hash')
import server from './server'

const isMac = process.platform == 'darwin'

function copyPNGWithMetadata (sourcePath: any, destinationPath: any) {
  // sharp(sourcePath)
  //   .clone()
  //   .toFile(destinationPath, (err: any, info: any) => {
  //     if (err) {
  //       console.error('复制文件时出错:', err);
  //     } else {
  //       console.log('文件复制成功!');
  //       console.log('复制后的文件信息:', info);
  //     }
  //   });
}

function copyFile (sourcePath: any, destinationPath: any) {
  const sourceStream = fs.createReadStream(sourcePath)
  const destinationStream = fs.createWriteStream(destinationPath)

  sourceStream.pipe(destinationStream)

  sourceStream.on('error', (err: any) => {
    console.error('读取源文件时出错:', err)
  })

  destinationStream.on('error', (err: any) => {
    console.error('写入目标文件时出错:', err)
  })

  destinationStream.on('finish', () => {
    console.log('文件复制成功!')
  })
}

function saveBase64Image (base64String: string, filePath: string) {
  // Remove the data:image/<image-extension>;base64 prefix
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')

  // Create a buffer from the base64 string
  const imageBuffer = Buffer.from(base64Data, 'base64')

  // Save the buffer as an image file
  fs.writeFile(filePath, imageBuffer, (err: any) => {
    if (err) {
      console.error('Error saving image:', err)
    } else {
      console.log('Image saved successfully!')
    }
  })
}

function saveJSON (data: any, filePath: string) {
  fs.writeFile(filePath, JSON.stringify(data), (err: any) => {
    if (err) {
      console.error('Error saving JSON:', err)
    } else {
      console.log('JSON saved successfully!')
    }
  })
}

function readJSON (filePath: string) {
  console.log(filePath)
  if (fs.existsSync(filePath)) {
    let d = fs.readFileSync(filePath, 'utf-8')
    return d ? JSON.parse(d) : null
  }
  return null
}

const pluginsPaths = path.join(app.getPath('userData'), 'plugins')
const cascadersPaths = path.join(app.getPath('userData'), 'cascaders.json')

// 遍历文件夹下的文件
function traverseDirectory (dir: any) {
  // 读取目录下的所有文件和文件夹
  fs.readdir(dir, (err: any, files: any[]) => {
    if (err) {
      console.error(err)
      return
    }

    // 遍历文件和文件夹
    files.forEach(file => {
      // 获取文件/文件夹的完整路径
      const filePath = path.join(dir, file)

      // 检查文件状态
      fs.stat(filePath, (err: any, stats: { isDirectory: () => any }) => {
        if (err) {
          console.error(err)
          return
        }

        // 如果是文件夹，则递归调用traverseDirectory函数
        if (stats.isDirectory()) {
          traverseDirectory(filePath)
        } else {
          // 如果是文件，则打印文件路径
          console.log(filePath)
        }
      })
    })
  })
}

const getMoreInfo = () => {
  let info: any = {}
  const data = fs.readFileSync(path.join(pluginsPaths, 'plugins.json'), 'utf8')
  let items = JSON.parse(data)
  for (const key in items) {
    const item = JSON.parse(
      fs.readFileSync(path.join(pluginsPaths, key, 'package.json'), 'utf8')
    )
    info[key] = item
    console.log(
      path.join(pluginsPaths, key, 'avatar.png'),
      fs.existsSync(path.join(pluginsPaths, key, 'avatar.png'))
    )
    if (fs.existsSync(path.join(pluginsPaths, key, 'avatar.png'))) {
      info[key].avatar = path.join(pluginsPaths, key, 'avatar.png')
    }
  }
  return info
}

const init = (plugins: any) => {
  ipcMain.handle('main:handle', async (event, args) => {
    console.log('main:handle', args)
    const { cmd, data } = args
    switch (cmd) {
      case 'plugins-list':
        const pluginManager = plugins.getStore()

        const items = pluginManager.getAllPlugins()
        const info = getMoreInfo()

        // console.log(items)

        let itemsNew = []
        for (const item of JSON.parse(JSON.stringify(items))) {
          if (info[item.name])
            itemsNew.push({
              ...item,
              avatar: info[item.name].avatar,
              info: info[item.name],
              id: hash({ url: item.url }) //取hash
            })
        }
        return itemsNew

      case 'executeJavaScript':
        const { code } = data
        let w = BrowserWindow.getFocusedWindow()
        let res = await w?.webContents.executeJavaScript(code)
        console.log('executeJavaScript result', res)
        return {
          result: res
        }

      case 'server':
        const { isStart, port, path, html } = data
        if (isStart) {
          return server.start(port || 3000, path, html)
        } else {
          return server.stop()
        }

      case 'read-file':
        //data._type
        let p = cascadersPaths
        return { data: readJSON(p), filePath: p }

      case 'save-as':
        let win: any = BrowserWindow.getFocusedWindow()
        const {
          title,
          originFilePath,
          defaultPath,
          base64,
          _type,
          json,
          isShow
        } = data
        let filepath = defaultPath

        if (isShow) {
          let filters: any =
            _type === 'image'
              ? { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
              : { name: 'JSON', extensions: ['json'] }
          filepath =
            dialog.showSaveDialogSync(win, {
              title,
              defaultPath: defaultPath || '',
              properties: [],
              filters: [
                ...filters,
                // { name: 'Movies', extensions: ['avi', 'mp4'] },
                // { name: 'JSON', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            }) || ''
        }

        if (filepath) {
          if (_type === 'image') {
            if (originFilePath) {
              copyFile(originFilePath, filepath)
            } else if (base64) {
              saveBase64Image(base64, filepath)
            }
          } else if (_type === 'json') {
            saveJSON(json, filepath)
          }
        }

      case 'setAlwaysOnTop':
        const { setAlwaysOnTop } = data
        let wm = BrowserWindow.getFocusedWindow()
        wm?.setAlwaysOnTop(setAlwaysOnTop)

      case 'getPath':
        const { type } = data
        const key = type || 'userData'
        if (key === 'userData')
          return isMac
            ? app
                .getPath(key)
                .replace(/Application Support.*/, 'Application Support')
            : app.getPath(key).replace(/AppData.*/, 'AppData')
        return app.getPath(key)

      default:
        break
    }

    return true
  })
}

export default { init }
