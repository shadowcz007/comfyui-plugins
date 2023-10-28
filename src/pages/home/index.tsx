// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { useEffect } from "react";
import { Button, ConfigProvider, Space, message, Card, Image, Input } from 'antd';
import { PlusOutlined, DashboardOutlined } from '@ant-design/icons';
const hash = require('object-hash');

// import '@google/model-viewer/dist/model-viewer';
const { Meta } = Card;

import { setup, plugins, extensionPoints, activationPoints } from 'pluggable-electron/renderer'

import ItemList from '../../components/ItemList'
import Inputs from '../../components/Inputs'
import OutputImages from '../../components/OutputImages'
import OutputPrompts from '../../components/OutputPrompts'
import Setup from '../../components/Setup'
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



export const App = () => {

    const [pluginItems, setPlugins]: any = React.useState([]);
    const [displayWorkflowPlugins, setDisplayWorkflowPlugins] = React.useState(false);

    const [historyItems, setHistoryItems]: any = React.useState([]);
    const [displayHistory, setDisplayHistory] = React.useState(false);
    const [setup, setSetup] = React.useState(false);

    const [status, setStatus] = React.useState({});
    const [serverStatus, setServerStatus] = React.useState(0);
    const [progress, setProgress] = React.useState(101);


    // input
    const [input, setInput]: any = React.useState(null);

    // output
    const [images, setImages]: any = React.useState({});
    const [prompts, setPrompts]: any = React.useState({});



    // 获取插件
    const initPlugin = async (name: string) => {
        await setupPE();

        const app = extensionPoints.get('app');
        for (const plugin of app._extensions) {
            if (plugin.name != name) {
                extensionPoints.unregisterAll(new RegExp(plugin.name));
            }
        }

        // console.log(app._extensions)

        let items = await window.electron.getPluginsList();

        items = Array.from(items, (i: any) => {
            i.disabled = i.name !== name;
            return i
        })

        console.log('runPluginByName', items)
        setPlugins(items)

        let plugin = items.filter((item: any) => item.name === name)[0]
        return plugin
    }

    // 获取插件的输入
    const getInput = async (name: string) => {
        let plugin = await initPlugin(name);
        if (extensionPoints.get('app')) extensionPoints.execute('app', {
            event: 'get-input',
            data: {
                callback: async (result: any) => {
                    console.log('#get-input', result)
                    setInput({ name, data: result });
                }
            }
        })
    }

    // 运行插件
    const runPluginByName = async (name: string, inputs: any) => {

        let plugin = await initPlugin(name);
        // console.log(plugin)

        // TODO 需要提供一个校对节点是否有效的功能

        // name version
        if (extensionPoints.get('app')) extensionPoints.execute('app', {
            event: 'run',
            data: {
                inputs,
                executeWorkflow: async (prompt: any) => {

                    if (prompt) {
                        let res = await window.electron.comfyApi('queuePrompt',
                            {
                                output: prompt,
                                workflow: {
                                    name: plugin.name,
                                    id: plugin.url //取hash
                                }
                            })
                        setStatus(res);

                        console.log(prompt, res)
                        localStorage.setItem('_plugin_current_workflow', JSON.stringify({
                            name: plugin.name,
                            prompt
                        }))
                    }
                }
            }
        })

        // if (extensionPoints.get('app-serial')) extensionPoints.executeSerial('app-serial', window.electron)

    }

    const openPlugin = () => {
        window.electron.getPluginsList().then((items: any) => {
            setPlugins(items);
            setDisplayWorkflowPlugins(true);
        })
    }

    const openSetup = async () => {

        setSetup(true)
    }

    const getHistory = async () => {
        const items = await window.electron.comfyApi('getHistory');
        let history = JSON.parse(localStorage.getItem('_plugin_history_') || '[]');


        for (const item of items) {
            const { name } = item.workflow;

            // name 需要判断是否是已安装的插件
            console.log(pluginItems.filter((p: any) => p.name == name)[0])
            if (pluginItems.filter((p: any) => p.name == name)[0]) {
                for (const nodeId in item.outputs) {
                    // 暂时只支持Mixlab的图片输出节点
                    // TODO 获取comfyui后端的output目录所在,支持output的images读取
                    if (item.outputs[nodeId].image_paths) {
                        let d = {
                            type: 'images',
                            data: item.outputs[nodeId].image_paths,
                            name,
                            avatar: item.outputs[nodeId].image_paths[0]
                        }
                        let id = hash(d);
                        if (!history.filter((h: any) => h.id == id)[0]) {
                            history.push({
                                ...d, id
                            })
                        }

                    }
                    if (item.outputs[nodeId].prompts) {

                        let d = {
                            type: 'prompts',
                            data: item.outputs[nodeId].prompts,
                            name
                        }
                        let id = hash(d);

                        if (!history.filter((h: any) => h.id == id)[0]) {
                            history.push({
                                ...d, id
                            })
                        }
                    }
                }
            }

        };

        localStorage.setItem('_plugin_history_', JSON.stringify(history))
        setHistoryItems(history);
        // console.log(result)
        setDisplayHistory(true)
    }

    const getQueue = async () => {
        const res = await window.electron.comfyApi('getQueue');
        const { Running, Pending } = res;
        // console.log(res) 
        return res
    }

    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        window.electron.getPluginsList().then((items: any) => {
            setPlugins(items);
            window.electron.comfyApi('init')
        });
        window.addEventListener('message', (res: any) => {
            console.log('###message', res.data?.data, pluginItems)
            const { event, data } = res.data?.data;
            setStatus({
                data,
                event
            })
            if (event == 'executed') {


                const workflow = JSON.parse(localStorage.getItem('_plugin_current_workflow') || '{}')

                const plugin = pluginItems.filter((p: any) => p.name === workflow.name)[0];

                console.log('executed', data, workflow, plugin);

                const node = workflow.prompt[data.node];

                // 暂时只支持mixlab自定义节点
                if (node.class_type == "TransparentImage") {
                    let title = node.inputs.filename_prefix;
                    // 运行时只有这种
                    // setImages
                    let images = data.output?.image_paths || {};
                    setImages({
                        data: images,
                        type: 'images',
                        name: workflow.name,
                        promptId: data.prompt_id,
                        node: data.node,//获取node的详细信息
                        title
                    });

                }

                // if (data.output?.prompts) {
                //     // console.log('executed', data.output.prompts);
                //     let prompts = data.output.prompts || {};
                //     setPrompts({ data: prompts, type: 'prompts', name });
                // }

                // 检查是否还在runing
                getQueue().then(res => {
                    const { Running } = res;
                    if (Running.length === 0) {
                        alert('DONE')
                        messageApi.open({
                            type: 'success',
                            content: 'DONE',
                        });

                        window.postMessage({
                            cmd: 'status:done', data: {
                                name
                            }
                        })
                    }
                })

            }
            if (event === 'execution_start') {
                // prompt_id
                let prompt_id = data.prompt_id;
                console.log('#execution_start', prompt_id)
            }

            if (event === 'close-output') {
                const { name, type, id } = data;
                if (type === 'images') {
                    setImages({})
                } else if (type === 'prompts') {
                    setPrompts({});
                } else if (type === 'setup') {
                    setSetup(false);
                }

                if (id) {
                    window.postMessage({
                        cmd: 'status:close', data: {
                            id
                        }
                    })
                }
            };

            if (event == 'close-input') {
                const { name } = data;
                setInput(null);
            }

            if (event === 'status') {
                // 是否连接了服务器
                if (data) {
                    // 正常
                    setServerStatus(0)
                } else {
                    // 服务不可用
                    setServerStatus(1)
                }
            }

            if (event === 'progress') {
                const { value, max } = data;
                setProgress(100 * value / max)
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

                {/* <h2  >{i18n.t('Manage plugin lifecycle')}</h2> */}
                {status && <p
                    style={{ color: 'white', background: 'gray' }}
                >{JSON.stringify(status)}</p>}

            </Space>

            {
                input && <Inputs data={input}
                    callback={(e: any) => {
                        const { cmd, data } = e;
                        if (cmd === 'run') {
                            const { name, data: d } = data;
                            runPluginByName(name, d)
                        }
                    }}
                />
            }

            {images.data && images.data?.length > 0 && <OutputImages
                data={images}
            />}

            {prompts.data && prompts.data?.length > 0 && <OutputPrompts
                data={prompts}
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
                            const { type, id } = data;
                            console.log('displayHistory', data);
                            if (type === 'images') {
                                // 图片结果
                                setImages(data);
                            } else if (type === 'prompts') {
                                // prompts结果
                                setPrompts(data);
                            }

                            window.postMessage({
                                cmd: 'status:switch',
                                data: {
                                    id
                                }
                            })


                        } else if (cmd == 'interrupt') {

                            const { type } = data;
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
                    pageSize={3}
                    callback={async (e: any) => {
                        // console.log(e)
                        const { cmd, data } = e;
                        if (cmd === 'remove') {
                            const { name } = data;
                            if (name) {
                                const res = await plugins.uninstall([name])
                                console.log(res ? 'Plugin successfully uninstalled' : 'Plugin could not be uninstalled')
                                let items = await window.electron.getPluginsList();
                                setPlugins(items)
                            }
                        } else if (cmd === 'display') {
                            const { show } = data;
                            setDisplayWorkflowPlugins(show);

                            // let items = await window.electron.getPluginsList();
                            // console.log(items)
                        } else if (cmd == 'run') {
                            const { name } = data;
                            if (name) {

                                // runPluginByName(name);
                                getInput(name);

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
                                        // console.log(pluginFiles)
                                        const installed = await plugins.install(pluginFiles)
                                        // console.log('Installed plugin:', installed);
                                        setStatus(installed);
                                        // await setupPE();
                                        window.electron.getPluginsList().then((items: any) => {
                                            // console.log('install', items)
                                            setPlugins(items);
                                        })
                                    }

                                }}> <PlusOutlined /> {i18n.t('Install')}</Button>,
                            <Button onClick={getQueue}> <DashboardOutlined /> {i18n.t('getQueue')}</Button>


                        ]
                    }
                />
            }

            {setup && <Setup />}

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