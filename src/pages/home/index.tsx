// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { useEffect } from "react";
import { Button, ConfigProvider, Space, Avatar, Card, Image,Progress } from 'antd';
import { PlusOutlined,DashboardOutlined } from '@ant-design/icons';
const hash = require('object-hash');

// import '@google/model-viewer/dist/model-viewer';
const { Meta } = Card;

import { setup, plugins, extensionPoints, activationPoints } from 'pluggable-electron/renderer'

import ItemList from '../../components/ItemList'
import OutputImages from '../../components/OutputImages'
import SuperBtn from '../../components/SuperBtn'
import "./index.css";

import i18n from "i18next";
import { rendererInit } from '../../i18n/config'
rendererInit()



// Set Pluggable Electron up in the renderer
async function setupPE() {
    // Enable the activation points
    setup({
        importer: async (pluginPath) => import( /* webpackIgnore: true */ pluginPath)
    })

    // Get plugins that have been installed previously
    // and register them with their activation points
    await plugins.registerActive()

    // insert at any point after the plugins have been registered
    await activationPoints.trigger('init')
}
setupPE()




declare const window: Window &
    typeof globalThis & {
        electron: any,
    }


// // Uninstall a plugin on clicking uninstall
// document.getElementById('uninstall-plg').addEventListener('submit', async (e) => {
//     e.preventDefault()
//     const pluginPkg = new FormData(e.target).get('plugin-pkg')

//     // Send the filename of the to be uninstalled plugin
//     // to the main process for removal
//     const res = await plugins.uninstall([pluginPkg])
//     console.log(res ? 'Plugin successfully uninstalled' : 'Plugin could not be uninstalled')
// })

// // Update all plugins on clicking update plugins
// document.getElementById('update-plgs').addEventListener('click', async (e) => {
//     const active = await plugins.getActive()
//     plugins.update(active.map(plg => plg.name))
//     console.log('Plugins updated')
// })

// // Trigger the init activation point on clicking activate plugins
// document.getElementById('activate-plgs').addEventListener('click', async (e) => {
//     // Trigger activation point
//     activationPoints.trigger('init')

//     // Enable extend functionality now that extensions have been registered
//     const buttons = document.getElementsByClassName('extend')
//     for (const btn of buttons) {
//         btn.disabled = false
//     }
//     console.log('"Init" activation point triggered')
// })

// // Create a menu that can be extended through plugins
// document.getElementById('extend-menu').addEventListener('click', async (e) => {
//     // Get additional menu items from plugins, providing the desired parent item
//     const menuItems = await Promise.all(extensionPoints.execute('extend-menu', 'demo-parent-li'))
//     // Insert items based on the parent and text provide by the plugin
//     menuItems.forEach(item => {
//         const demoAnchor = document.createElement('a')
//         demoAnchor.classList.add('nav-link')
//         demoAnchor.href = '#'
//         demoAnchor.innerText = item.text

//         const demoLi = document.createElement('li')
//         demoLi.appendChild(demoAnchor)

//         const parentId = item.hasOwnProperty('parent') ? item.parent : 'demo-menu'
//         document.getElementById(parentId).appendChild(demoLi)
//     })
// })

// // Calculate a cost based on plugin extensions
// document.getElementById('calc-price').addEventListener('submit', async (e) => {
//     e.preventDefault()
//     const price = new FormData(e.target).get('price')
//     // Get the cost, calculated in multiple steps, by the plugins
//     const cost = await extensionPoints.executeSerial('calc-price', price)
//     // Display result in the app
//     document.getElementById('demo-cost').innerText = cost
// })

// // Provide image url to plugins to display as desired
// document.getElementById('display-img').addEventListener('submit', async (e) => {
//     e.preventDefault()
//     const img = new FormData(e.target).get('img-url')
//     // Provide image url to plugins
//     extensionPoints.execute('display-img', img)
// })





export const App = () => {

    const [pluginItems, setPlugins]: any = React.useState([]);
    const [displayWorkflowPlugins, setDisplayWorkflowPlugins] = React.useState(false);

    const [historyItems, setHistoryItems]: any = React.useState([]);
    const [displayHistory, setDisplayHistory] = React.useState(false);

    const [status, setStatus] = React.useState({});
    const [serverStatus,setServerStatus]= React.useState(0);
    const [progress,setProgress]=React.useState(101);

    const [images, setImages] = React.useState({});

    const [promptIds, setPromptIds] = React.useState({});


    // 运行插件
    const runPluginByName = async (name: string) => {

        await setupPE();

        const app = extensionPoints.get('app');
        for (const plugin of app._extensions) {
            if (plugin.name != name) {
                extensionPoints.unregisterAll(new RegExp(plugin.name));
            }
        }

        // console.log(app._extensions)

        let items = await window.electron.getPluginsList();
        setPlugins(items);
        let plugin = items.filter((item: any) => item.name === name)[0]
        // console.log(plugin)

        // TODO 需要提供一个校对节点是否有效的功能

        // name version
        if (extensionPoints.get('app')) extensionPoints.execute('app', {
            event: 'run',
            data: {
                executeWorkflow: async (workflow: any, prompt: any) => {

                    if (prompt) {
                        let res = await window.electron.comfyApi('queuePrompt',
                            {
                                output: prompt,
                                workflow: {
                                    ...(workflow || {}),
                                    name: plugin.name,
                                    id: plugin.url //取hash
                                }
                            })
                        setStatus(res)
                        console.log(prompt, res)
                        localStorage.setItem('_plugin_current_workflow_name',plugin.name)
                    }
                }
            }
        })

        // if (extensionPoints.get('app-serial')) extensionPoints.executeSerial('app-serial', window.electron)

    }

    const openPlugin=()=>{
        window.electron.getPluginsList().then((items: any) => {
            setPlugins(items);
            setDisplayWorkflowPlugins(true);
        })
    }

    const openSetup=async()=>{
        const res = await window.electron.comfyApi('getSystemStats');
        setStatus(res)
    }

    const getHistory=async ()=>{
        const items = await window.electron.comfyApi('getHistory');
        let history=JSON.parse(localStorage.getItem('_plugin_history_')||'[]');

                
                    for (const item of items) {
                        const { name } = item.workflow;
                        
                        // name 需要判断是否是已安装的插件
                        console.log(pluginItems.filter((p: any) => p.name == name)[0])
                        if (pluginItems.filter((p: any) => p.name == name)[0]) {
                            for (const nodeId in item.outputs) {
                                // 暂时只支持Mixlab的图片输出节点
                                // TODO 获取comfyui后端的output目录所在,支持output的images读取
                                if (item.outputs[nodeId].image_paths) {
                                    let d={
                                        type: 'images',
                                        data: item.outputs[nodeId].image_paths,
                                        name,
                                        avatar:item.outputs[nodeId].image_paths[0]
                                    }
                                    let id=hash(d);
                                    if(!history.filter((h:any)=>h.id==id)[0]){
                                        history.push({
                                            ...d,id
                                        })
                                    }
                                    
                                 }
                                if (item.outputs[nodeId].prompts) {
                                    
                                    let d={
                                        type: 'prompts',
                                        data: item.outputs[nodeId].prompts,
                                        name
                                    }
                                    let id=hash(d);
                                    
                                    if(!history.filter((h:any)=>h.id==id)[0]){
                                        history.push({
                                            ...d,id
                                        })
                                    }
                                }
                            }
                        }

                    };

                    localStorage.setItem('_plugin_history_',JSON.stringify(history))
                    setHistoryItems(history);
                    // console.log(result)
                    setDisplayHistory(true)
    }

    const getQueue=async ()=>{
        const res = await window.electron.comfyApi('getQueue');
        const {Running,Pending}=res;
        // console.log(res) 
        return res
    }

    useEffect(() => {
        window.electron.getPluginsList().then((items: any) => {
            setPlugins(items);
            window.electron.comfyApi('init')
        });
        window.addEventListener('message', (res: any) => {
            console.log('message',res.data.data)
            const { event, data } = res.data.data;
            setStatus({
                data,
                event
            })
            if (event == 'executed') {
                console.log('executed', data);

                const name=localStorage.getItem('_plugin_current_workflow_name')||'-'

                // 区分不同的类型
                // setImages
                let images = data.output?.image_paths || [];
                setImages({data:images,type:'images',name});
                
                // 检查是否还在runing
                getQueue().then(res=>{
                    const {Running}=res;
                    if(Running.length===0){
                       alert('DONE')
                       window.postMessage({ cmd: 'status:done' })
                    }
                })
                
            }
            if (event === 'execution_start') {
                // prompt_id
                let prompt_id = data.prompt_id;
                console.log('#execution_start', prompt_id)
            }

            if(event==='close-output'){
                const {name,type}=data;
                if(type==='images'){
                    setImages({})
                }
            }

            if(event==='status'){
                // 是否连接了服务器
                if(data){
                    // 正常
                    setServerStatus(0)
                }else{
                    // 服务不可用
                    setServerStatus(1)
                }
            }

            if(event==='progress'){
                const {value,max}=data;
                setProgress(100*value/max)
            }


        })
        return () => {
            // if (backFn) {
            //   backFn();
            // }
        };
    }, []);

    // console.log('images',images)
    return (
        <ConfigProvider
            theme={{
                token: {
                    // Seed Token，影响范围大
                    colorPrimary: '#00b96b',
                    borderRadius: 2,

                    // 派生变量，影响范围小
                    colorBgContainer: '#f6ffed',
                },
            }}
        >
            <Space
                className="menu-btns"
            >
                <Progress steps={5} percent={progress} />
                {/* <h2  >{i18n.t('Manage plugin lifecycle')}</h2> */}
                {status && <p
                    style={{ color: 'white', background: 'gray' }}
                >{JSON.stringify(status)}</p>}

            </Space>

            {images?.data?.length>0&&<OutputImages 
                        images={images}
                    />}

        
            {/* 做一个历史记录的列表 */}
            {displayHistory &&
                <ItemList
                    name="History"
                    items={historyItems}
                    callback={async (e: any) => {
                        // console.log(e)
                        const { cmd, data } = e;
                        if (cmd === 'display') {
                            const { show } = data;
                            setDisplayHistory(show);
                        } else if (cmd === 'run') {
                            // 显示历史记录结果                        
                            const { type } = data;
                            // console.log('items',items);
                            if (type === 'images') {
                                // 图片结果
                                setImages(data)
                            } else if (type === 'prompts') {
                                // prompts结果

                            }
                        }else if(cmd=='interrupt'){
                            
                            const { type  } = data;
                            // console.log('items',items);
                            if (type === 'images') {
                                // 图片结果
                                setImages({})
                            } else if (type === 'prompts') {
                                // prompts结果

                            }
                        }
                    }}
                />}


            {
                displayWorkflowPlugins &&
                <ItemList
                    name="Workflow Plugins"

                    items={pluginItems}

                    callback={async (e: any) => {
                        // console.log(e)
                        const { cmd, data } = e;
                        if (cmd === 'remove') {
                            const { name } = data;
                            if (name) {
                                const res = await plugins.uninstall([name])
                                console.log(res ? 'Plugin successfully uninstalled' : 'Plugin could not be uninstalled')
                            }
                        } else if (cmd === 'display') {
                            const { show } = data;
                            setDisplayWorkflowPlugins(show);

                            // let items = await window.electron.getPluginsList();
                            // console.log(items)
                        } else if (cmd == 'run') {
                            const { name } = data;
                            if (name) {
                                runPluginByName(name)
                            }
                        } else if (cmd == 'interrupt') {
                            const { name } = data;
                            //TODO  根据workflow来取消
                            window.electron.comfyApi('interrupt');
                        }

                    }}

                    actions={
                        [
                            <Button onClick={
                                async () => {
                                    const pluginFiles = window.electron.openInstallFile()
                                    if (pluginFiles) {
                                        console.log(pluginFiles)
                                        const installed = await plugins.install(pluginFiles)
                                        console.log('Installed plugin:', installed);
                                        setStatus(installed)
                                        // await setupPE();
                                        window.electron.getPluginsList().then((items: any) => {
                                            setPlugins(items);
                                        })
                                    }

                                }}> <PlusOutlined /> {i18n.t('Install')}</Button>,
                                <Button onClick={getQueue}> <DashboardOutlined /> {i18n.t('getQueue')}</Button>
                                    
                                
                        ]
                    }
                />
            }

            <SuperBtn 
            openPlugin={openPlugin}
            getHistory={getHistory}
            openSetup={openSetup}
            serverStatus={serverStatus}
            />

        </ConfigProvider>

    );
};


// 严格模式，会在开发环境重复调用2次
createRoot(document.getElementById("root") as Element).render(
    // <StrictMode>
    // </StrictMode>
    <App />
);