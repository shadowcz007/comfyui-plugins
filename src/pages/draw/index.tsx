// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { useEffect, useState } from "react";
import { Button, ConfigProvider, Switch, Input, Card, Spin, Progress } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
const hash = require('object-hash');


const { TextArea } = Input;
// import '@google/model-viewer/dist/model-viewer';
const { Meta } = Card;

import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";

import "./index.css";
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

        if (minX === null) minX = x;
        if (minY === null) minY = y;
        if (maxX === null) maxX = rightX;
        if (maxY === null) maxY = bottomY;

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

const loadImage = (url: string) => {
    let im = new Image();
    im.src = url;
    return new Promise((res, rej) => {
        im.onload = () => {
            res(im)
        }
    })
}

const toBlob = (canvas: any) => {
    return new Promise((res, rej) => {
        canvas?.toBlob(async (blob: any) => {
            res(blob)
        }, 'image/png')
    })


}

async function createMask(newBase64: string, oldBase64: string) {
    let nImg: any = await loadImage(newBase64);
    let oImg: any = await loadImage(oldBase64);
    let nCanvas = document.createElement('canvas');
    let oCanvas = document.createElement('canvas');
    nCanvas.width = nImg?.naturalWidth;
    nCanvas.height = nImg?.naturalHeight;
    oCanvas.width = oImg?.naturalWidth;
    oCanvas.height = oImg?.naturalHeight;

    let nCtx = nCanvas.getContext('2d');
    let oCtx = oCanvas.getContext('2d');

    oCtx?.drawImage(oImg, 0, 0);
    nCtx?.drawImage(nImg, 0, 0);

    // 获取原始图像的像素数据
    const imageDataNew: any = nCtx?.getImageData(0, 0, nCanvas.width, nCanvas.height);
    const pixelsNew: any = imageDataNew?.data;

    const imageDataOld: any = oCtx?.getImageData(0, 0, oCanvas.width, oCanvas.height);
    const pixelsOld: any = imageDataOld?.data;

    // 遍历每个像素，计算差值
    for (let i = 0; i < pixelsNew.length; i += 4) {
        // 计算差值
        const diffR = Math.abs(pixelsOld[i] - pixelsNew[i]);
        const diffG = Math.abs(pixelsOld[i + 1] - pixelsNew[i + 1]);
        const diffB = Math.abs(pixelsOld[i + 2] - pixelsNew[i + 2]);

        // 将差值设置为新的像素值
        pixelsNew[i] = diffR > 10 ? 0 : 255;
        pixelsNew[i + 1] = diffG > 10 ? 0 : 255;
        pixelsNew[i + 2] = diffB > 10 ? 0 : 255;
    }

    // 将修改后的像素数据放回canvas上
    nCtx?.putImageData(imageDataNew, 0, 0);

    return nCanvas.toDataURL()
}


function getInputOfPrompt() {
    const getInputData = JSON.parse(localStorage.getItem('get-input') || '{}');
    const input = getInputData.input;
    if (input?.length > 0) {
        let node = input.filter((inp: any) => inp.type === 'string')[0]
        if (node) {
            // console.log(node.value)
            return node.value
        }
    }
}


export const App = () => {
    const [excalidrawAPI, setExcalidrawAPI]: any = useState(null);
    const [canvasUrl, setCanvasUrl] = useState("");
    const [canvasObj, setCanvasObj]: any = useState([]);
    const [auto, setAuto] = useState(false);
    const [loading, setLoading] = useState(false);

    let p = getInputOfPrompt()

    const [prompt, setPrompt] = useState(p || '');

    const getInput = async () => {
        if (!excalidrawAPI) {
            return
        }

        const elements = excalidrawAPI.getSceneElements().filter((e: any) => {
            if (e.type == 'text') return e.text.trim()
            console.log(e.type, e.width, e, e.opacity)
            return e.width && e.height
        });

        if (!elements || !elements.length) {
            return
        }

        const { width, height } = calculateCanvasSize(elements)
        console.log('calculateCanvasSize', width, height)

        const obj: any = {
            elements,
            appState: {
                exportWithDarkMode: false,
            },
            files: excalidrawAPI.getFiles(),
            getDimensions: () => { return { width, height } }
        }

        const canvas = await exportToCanvas(obj);
        const ctx = canvas.getContext("2d");
        const base64 = canvas.toDataURL();



        if (base64 != canvasUrl && (canvasUrl === '' || (obj.getDimensions().width != canvasObj.getDimensions().width ||
            obj.getDimensions().height != canvasObj.getDimensions().height
        ))) {
            // 新生成 img2img模式

            setCanvasObj(obj)
            setCanvasUrl(base64);

            const blob: any = await toBlob(canvas);

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

                console.log('新生成 img2img模式', {
                    name: getInputData.name,
                    data: inputNew
                })

            }

        } else if (base64 != canvasUrl) {
            // inpainter模式
            // console.log('inpainter模式')

            // 把之前的画布，旧元素保留，新元素变成透明的
            let elements: any = [];
            for (const j of obj.elements) {
                let isNew = true;
                for (const cj of canvasObj.elements) {
                    if (cj.id === j.id) isNew = false
                }
                if (isNew) {
                    elements.push({
                        ...j,
                        opacity: 0
                    })
                } else {
                    elements.push({
                        ...j
                    })
                }
            };


            const canvasOld = await exportToCanvas({
                ...obj,
                elements
            });
            const base64Old = canvasOld.toDataURL();

            setCanvasUrl(base64);

            let mask = await createMask(base64, base64Old);

            let t: any = document?.querySelector('.test');
            console.log('inpainter模式', mask, t)
            t.src = mask

        }
    }

    useEffect(() => {

        // console.log(prompt)
        // if (prompt) setPrompt(prompt)
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

        excalidrawAPI?.onPointerUp(() => {
            console.log('##onPointerUp', auto)
            auto && getInput()
        });

        return () => {
            // if (backFn) {
            //   backFn();
            // }
        };
    }, [excalidrawAPI, auto])

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
            <div style={{ height: "90vh", }}>
                <Excalidraw excalidrawAPI={(api: any) => {
                    console.log(api)
                    setExcalidrawAPI(api)
                }}

                // renderTopRightUI={() => {
                //     return (
                //         <Button
                //             type="primary"
                //             onClick={() => window.alert("This is dummy top right UI")}
                //         >
                //             Click me
                //         </Button>
                //     );
                // }}
                />

            </div>
            <img className="test" src="" style={{
                position: 'fixed',

                right: 0, zIndex: 99999,

                width: 200,
                height: 200,
                top: 0,
                background: 'gray'

            }} />
            <div style={{
                position: 'fixed',
                left: 0,
                top: '90vh',
                maxHeight: 98,
                width: '100%',
                zIndex: 99999,
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                background: '#eee',
                padding: 12
            }}>

                <TextArea
                    value={prompt}
                    style={{
                        width: '60%'
                        // backgroundColor: 'black',
                        // borderRadius: '100%'
                    }}
                    onChange={(e: any) => {
                        console.log(e.target.value)
                        setPrompt(e.target.value)
                    }}
                    rows={4}
                    placeholder="maxLength is 180" maxLength={180} />
                <Button
                    style={{
                        height: 56,
                        width: 148,
                        backgroundColor: 'black',
                        borderRadius: 6,
                        color: 'white'
                    }}
                    onClick={() => {
                        setCanvasUrl('')
                        getInput()
                        setLoading(true)
                    }}>Start{loading?'*':''}</Button>
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    //   defaultChecked
                    onChange={(e) => setAuto(e)}
                />
            </div>

        </ConfigProvider>
    );
};


// 严格模式，会在开发环境重复调用2次
createRoot(document.getElementById("root") as Element).render(
    // <StrictMode>
    // </StrictMode>
    <App />
);