// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { useEffect } from "react";
import { Button, ConfigProvider, Space, Avatar, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';


// import '@google/model-viewer/dist/model-viewer';


const { Meta } = Card;

import { setup, plugins, extensionPoints, activationPoints } from 'pluggable-electron/renderer'

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

const pluginCard = (name: string, url: string, key: any) => (
    <Card
        size="small"
        style={{ width: 300 }}
        key={key}
        // cover={
        //     <img
        //         alt="example"
        //         src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        //     />
        // }
        actions={[

            <CloseOutlined key="edit"
                onClick={async () => {
                    const res = await plugins.uninstall([name])
                    console.log(res ? 'Plugin successfully uninstalled' : 'Plugin could not be uninstalled')
                }}
            />,

        ]}
    >
        <Meta
            avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel" />}
            title={name}
            description={url}
        />
    </Card>
);




export const App = () => {

    const [pluginItems, setPlugins] = React.useState([]);
    const [display, setDisplay] = React.useState(true);

    useEffect(() => {
        window.electron.getPluginsList().then((items: any) => {
            setPlugins(items);
        })
        return () => {
            // if (backFn) {
            //   backFn();
            // }
        };
    }, []);

    return (
        <div>
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

                    <Button type="primary" onClick={
                        async () => {

                            const pluginFiles = window.electron.openInstallFile()
                            if (pluginFiles) {
                                console.log(pluginFiles)
                                const installed = await plugins.install(pluginFiles)
                                console.log('Installed plugin:', installed);

                                await setupPE();

                                window.electron.getPluginsList().then((items: any) => {
                                    setPlugins(items);
                                })

                            }

                        }}>{i18n.t('Install')}</Button>

                    <Button onClick={async () => {
                        if (extensionPoints.get('app')) extensionPoints.execute('app', window.electron)

                        // if (extensionPoints.get('app-serial')) extensionPoints.executeSerial('app-serial', window.electron)
                        setDisplay(false);
                    }}>{i18n.t('run')}</Button>
                </Space>
            </ConfigProvider>


            {display &&
                Array.from(pluginItems, (item: any, index: number) => pluginCard(item.name, item.url, index))
                // JSON.stringify(pluginItems, null, 2)
            }

            {/* <model-viewer
                style={{
                    width: 200,
                    height: 200
                }}
                // camera-controls
                // disable-zoom
                // touch-action="pan-y" 

                alt="A 3D model of a sphere"
                src="https://modelviewer.dev/shared-assets/models/reflective-sphere.gltf">
            </model-viewer> */}

        </div>
    );
};


// 严格模式，会在开发环境重复调用2次
createRoot(document.getElementById("root") as Element).render(
    // <StrictMode>
    // </StrictMode>
    <App />
);