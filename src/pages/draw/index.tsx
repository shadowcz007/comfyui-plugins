// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { useEffect, useState } from "react";
import { Button, ConfigProvider, Space, Input, Card, Spin, Progress } from 'antd';
import { PlusOutlined, DashboardOutlined } from '@ant-design/icons';
const hash = require('object-hash');


const { TextArea } = Input;
// import '@google/model-viewer/dist/model-viewer';
const { Meta } = Card;

import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";


import i18n from "i18next";
import { rendererInit } from '../../i18n/config'
rendererInit()


declare const window: Window &
    typeof globalThis & {
        electron: any
    }

function calculateCanvasSize(arr: any) {
    let minX = null;
    let minY = null;
    let maxX = null;
    let maxY = null;

    for (let i = 0; i < arr.length; i++) {
        const { x, y, width, height } = arr[i];
        // console.log(x,y,width,height)
        const rightX = x + width;
        const bottomY = y + height;

        if(minX===null) minX=x;
        if(minY===null) minY=y;
        if(maxX===null) maxX=rightX;
        if(maxY===null) maxY=bottomY;

        if (x < minX) {
            minX = x;
        }

        if (y < minY) {
            minY = y;
        }

        if (rightX > maxX) {
            maxX = rightX;
        }

        if (bottomY > maxY) {
            maxY = bottomY;
        }
    }

    const canvasWidth = maxX - minX;
    const canvasHeight = maxY - minY;

    return { width: canvasWidth, height: canvasHeight };
}


function getInputOfPrompt() {
    const getInputData = JSON.parse(localStorage.getItem('get-input') || '{}');
    const input = getInputData.input;
    if (input?.length > 0) {
        let node = input.filter((inp: any) => inp.type === 'string')[0]
        if (node) {
            return node.value
        }
    }
}


export const App = () => {
    const [excalidrawAPI, setExcalidrawAPI]: any = useState(null);
    const [canvasUrl, setCanvasUrl] = useState("");
    const [prompt, setPrompt] = useState('');

    const getInput = async () => {
        if (!excalidrawAPI) {
            return
        }

        const elements = excalidrawAPI.getSceneElements().filter((e: any) => {
            if (e.type == 'text') return e.text.trim()
            console.log(e.type, e.width,e.height)
            return e.width && e.height
        });

        if (!elements || !elements.length) {
            return
        }

        const { width, height } = calculateCanvasSize(elements)
        console.log('calculateCanvasSize', width, height)

        const canvas = await exportToCanvas({
            elements,
            appState: {
                exportWithDarkMode: false,
            },
            files: excalidrawAPI.getFiles(),
            getDimensions: () => { return { width, height } }
        });
        const ctx = canvas.getContext("2d");
        const base64 = canvas.toDataURL();

        if (base64 != canvasUrl) {
            setCanvasUrl(base64);
            // console.log(base64)
            canvas.toBlob(async (blob: any) => {
                // 创建一个 File 对象
                const file = new File([blob], 'image' + (new Date()).getTime() + '.png', { type: blob.type })

                // 发送请求
                const filePath = await window.electron.uploadFile(file)
                // console.log(filePath)
                const getInputData = JSON.parse(localStorage.getItem('get-input') || '{}');

                const input = getInputData.input;

                if (getInputData.name && input?.length > 0) {
                    let inputNew = Array.from(input, (inp: any) => {
                        if (inp.type === 'image') {
                            inp.value = filePath;
                        }
                        if (inp.type === 'string') {
                            inp.value = prompt;
                        }
                        return inp
                    })

                    // 插件名称
                    window.electron.sendToHome({
                        cmd: 'runPrompt',
                        data: {
                            name: getInputData.name,
                            data: inputNew
                        }
                    })

                }


                // 现在，你可以将 formData 用于发送到服务器或其他操作
            }, 'image/png')


        }
    }

    useEffect(() => {
        let prompt = getInputOfPrompt()
        if (prompt) setPrompt(prompt)
        // console.log('#useEffect')
        // excalidrawAPI?.onChange(() => {
        //     const elements = excalidrawAPI.getSceneElements().filter((e: any) => {
        //         if (e.type == 'text') return e.text.trim()

        //         return e.width && e.height
        //     });
        //     console.log('onChange', Array.from(elements, (e: any) => [e.type, e.width, e.height, e]))
        //     // window._elements=elements;
        //     if (elements?.length > 0) {
        //         getInput(canvasUrl)
        //     }
        // })
        excalidrawAPI?.onPointerUp(()=>getInput());

        return () => {
            // if (backFn) {
            //   backFn();
            // }
        };
    }, [excalidrawAPI])

    return (

        <div style={{ height: "95vh", }}>

            <div style={{
                position: 'fixed',
                left: 0,
                bottom: 120,
                maxHeight: 98,
                width: '100%',
                zIndex: 99999,
                textAlign: 'center'
                // backgroundColor: 'black',
                // borderRadius: '100%'
            }}>

                <TextArea
                    defaultValue={prompt}
                    style={{
                        width: '60%'
                        // backgroundColor: 'black',
                        // borderRadius: '100%'
                    }}
                    onChange={(e: any) => {
                        // console.log(e)
                        setPrompt(e.currentTarget.value)
                    }}
                    rows={4}
                    placeholder="maxLength is 6" maxLength={6} />

            </div>


            <Button
                style={{
                    position: 'fixed',
                    left: 'calc(50% - 44px)',
                    bottom: 44,
                    height: 56,
                    width: 56,
                    zIndex: 99999,
                    backgroundColor: 'black',
                    borderRadius: '100%'
                }}
                onClick={() => getInput()}>###</Button>
            <Excalidraw excalidrawAPI={(api: any) => {
                console.log(api)
                setExcalidrawAPI(api)
            }} />

        </div>
    );
};


// 严格模式，会在开发环境重复调用2次
createRoot(document.getElementById("root") as Element).render(
    // <StrictMode>
    // </StrictMode>
    <App />
);