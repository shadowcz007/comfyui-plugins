import {
  contextBridge,
  ipcRenderer,
  clipboard,
  IpcRendererEvent,
  nativeImage,
  webFrame,
  BrowserWindow
} from 'electron'
const hash = require('object-hash')
const remote = require('@electron/remote')

const useFacade = require('pluggable-electron/facade')
useFacade()

import {
  setup,
  plugins,
  extensionPoints,
  activationPoints
} from 'pluggable-electron/renderer'

import ComfyApi from './preload/ComfyApi'
import i18n from 'i18next'
const api: any = new ComfyApi()

const update = (data: any) => window.postMessage({ cmd: 'status:render', data })

// cb 是主应用的回调
//  extensionPoints 是插件的回调
const apiInit = () => {
  api.addEventListener('status', ({ detail }: any) => {
    console.log('status', detail)
    update({ event: 'status', data: detail })
  })

  api.addEventListener('reconnecting', () => {
    console.log('Reconnecting...')
    update({ event: 'reconnecting' })
  })

  api.addEventListener('reconnected', () => {
    console.log('reconnected')
    update({ event: 'reconnected' })
  })

  api.addEventListener('progress', ({ detail }: any) => {
    console.log(detail)
    update({ event: 'progress', data: detail })
    if (extensionPoints.get('app'))
      extensionPoints.execute('app', { event: 'progress', data: detail })
  })

  api.addEventListener('executing', ({ detail, msg }: any) => {
    // console.log('executing',msg)
    update({ event: 'executing', data: { ...detail, ...msg } })
  })

  api.addEventListener('executed', ({ detail }: any) => {
    console.log('executed', detail)
    if (extensionPoints.get('app'))
      extensionPoints.execute('app', { event: 'executed', data: detail })

    update({ event: 'executed', data: detail })
  })

  api.addEventListener('execution_start', ({ detail }: any) => {
    console.log('execution_start', detail)
    if (extensionPoints.get('app'))
      extensionPoints.execute('app', { event: 'execution_start', data: detail })
    if (detail) update({ event: 'execution_start', data: detail })
  })

  api.addEventListener('execution_error', ({ detail }: any) => {
    console.log('execution_error', detail)

    update({ event: 'execution_error', data: detail })
  })

  api.addEventListener('b_preview', ({ detail }: any) => {
    console.log('b_preview', detail)
    update({ event: 'b_preview', data: detail })
  })

  api.init()
}

const global: any = {}

const isDebug = !!process?.env.npm_lifecycle_script?.match('--DEV')

export type Channels = 'ipc-plugins'

let win = remote.getCurrentWindow()
window.addEventListener('mousemove', (event: any) => {
  // console.log(event?.target.id,event?.target.className)
  if (
    !['HTML'].includes(event.target.nodeName) ||
    event?.target.className === '_plugin_none_'
  ) {
    win.setIgnoreMouseEvents(false)
  } else {
    win.setIgnoreMouseEvents(true, { forward: true })
  }
})

const electronHandler = {
  ipcRenderer: {
    send (channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args)
    },
    on (channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => {
        return func(...args)
      }

      ipcRenderer.on(channel, subscription)

      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    },
    once (channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args))
    },
    invoke (channel: Channels, args: unknown[]) {
      return ipcRenderer.invoke(channel, args)
    }
  },
  getPluginsList: () =>
    ipcRenderer.invoke('main:handle', { cmd: 'plugins-list' }),
  plugins: () => {
    return require('pluggable-electron/renderer')
  },
  getCurrentWindow: () => remote.BrowserWindow.getFocusedWindow(),
  openInstallFile: () => {
    let w: any = remote.BrowserWindow.getFocusedWindow()
    // w.setAlwaysOnTop(false)
    const filepath: string =
      remote.dialog.showOpenDialogSync(w, {
        title: '保存',
        // defaultPath: Index.databasePath + filename,
        properties: ['openFile'],
        filters: [{ name: 'All Files', extensions: ['*'] }]
      }) || ''
    // w.setAlwaysOnTop(true)
    return filepath
  },
  getPath: (key: string = 'userData') => {
    return ipcRenderer.invoke('main:handle', {
      cmd: 'getPath',
      data: { type: key }
    })
  },
  readPath: (_type = 'cascaders') => {
    return ipcRenderer.invoke('main:handle', {
      cmd: 'read-file',
      data: { _type }
    })
  },
  isDebug,
  platform: process.platform,
  pasteText: () => {
    return clipboard.readText()
  },
  openDraw: (initData: any) => {
    // TODO 初始化的数据

    return ipcRenderer.invoke('main:handle', {
      cmd: 'open-draw'
    })
  },
  executeJavaScript: (code: string) => {
    return ipcRenderer.invoke('main:handle', {
      cmd: 'executeJavaScript',
      data: { code: code }
    })
  },
  comfyApi: async (cmd: string, data: any) => {
    if (cmd === 'init') {
      apiInit()
    } else if (cmd === 'queuePrompt') {
      const { output, workflow } = data
      return api.queuePrompt(0, { output, workflow })
    } else if (cmd == 'getNodeDefs') {
      return await api.getNodeDefs()
    } else if (cmd == 'getHistory') {
      const res = await api.getHistory()
      let items: any = []
      for (const h of res.History) {
        // 定义了id和name的插件才允许显示
        if (
          h.prompt[3]?.extra_pnginfo?.workflow &&
          h.prompt[3]?.extra_pnginfo?.workflow.id &&
          h.prompt[3]?.extra_pnginfo?.workflow.name
        ) {
          items.push({
            ...h,
            workflow: {
              promptId: h.prompt[1],
              ...h.prompt[3].extra_pnginfo.workflow
            }
          })
        }
      }
      return items
    } else if (cmd == 'interrupt') {
      return await api.interrupt()
    } else if (cmd === 'getSystemStats') {
      return await api.getSystemStats()
    } else if (cmd == 'getQueue') {
      return await api.getQueue()
    } else if (cmd == 'getEmbeddings') {
      return await api.getEmbeddings()
    } else if (cmd === 'updateUrl') {
      const { url } = data || {}
      let newUrl = await api._update(url)
      api.socket = null
      api.socket?.close()
      api.init()
      // console.log(api)
      return newUrl
    } else if (cmd === 'apiURL') {
      const { route } = data || {}
      return api.apiURL(route || '')
    }
  },
  uploadFile: async (file: string | Blob) => {
    try {
      // Wrap file in formdata so it includes filename
      const body = new FormData()
      body.append('image', file)
      // if (pasted) body.append('subfolder', 'pasted')
      const resp = await api.fetchApi('/upload/image', {
        method: 'POST',
        body
      })

      if (resp.status === 200) {
        const data = await resp.json()
        // Add the file to the dropdown list and update the widget value
        let path = data.name
        if (data.subfolder) path = data.subfolder + '/' + path
        return path
      } else {
        alert(resp.status + ' - ' + resp.statusText)
      }
    } catch (error) {
      alert(error)
    }
  },
  sendToHome: (obj: any) => {
    return ipcRenderer.invoke('main:handle', obj)
  },
  server: (isStart: boolean, port: number, path: string, html: string) =>
    ipcRenderer.invoke('main:handle', {
      cmd: 'server',
      data: { isStart, port, path, html }
    }),
  saveAs: (defaultPath: string, data: any) => {
    ipcRenderer.invoke('main:handle', {
      cmd: 'save-as',
      data: {
        title: i18n.t('save as'),
        ...data,
        defaultPath
      }
    })
  },
  setAlwaysOnTop: (setAlwaysOnTop: boolean) => {
    ipcRenderer.invoke('main:handle', {
      cmd: 'setAlwaysOnTop',
      data: { setAlwaysOnTop }
    })
  },
  global: (key: string, val: any) => {
    if (val !== undefined) global[key] = val
    return global[key]
  },
  hash: (obj: any) => {
    return hash(obj)
  }
}

contextBridge.exposeInMainWorld('electron', electronHandler)
export type ElectronHandler = typeof electronHandler
