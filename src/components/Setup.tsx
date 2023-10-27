import React, { useState } from 'react';
import { Button, Input, Tag, Typography, Card, Space } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";

const { Text, Title } = Typography;

declare const window: Window &
    typeof globalThis & {
        electron: any
    }

type PropType = {
    [propName: string]: any;
}

type StateType = {
    [stateName: string]: any;
}

interface App {
    state: StateType;
    props: PropType
}

const _savePosition = (e: any) => {
   
    const { x, y } =e.target.getBoundingClientRect();
    localStorage.setItem(`_setup_position`, JSON.stringify({
        x, y
    }))

}

class App extends React.Component {

    constructor(props: any) {
        super(props);
        const defaultPosition = JSON.parse(localStorage.getItem(`_setup_position`) || JSON.stringify({
            x: 0, y: 0
        }))
        this.state = {
            title: i18n.t('Setup'),
            url: '',
            defaultPosition
        }


    }

    componentDidMount() {
        // this.setupConnection();
        window.electron.comfyApi('getSystemStats').then(async (res: any) => {
            let url = await window.electron.comfyApi('updateUrl')
            console.log('getSystemStats', url)
            this.setState({
                ...res,
                url
            })
        })

        window.addEventListener('message', (res: any) => {

            const { event, data } = res.data?.data;


            if (event === 'status') {
                // 是否连接了服务器
                if (data) {
                    // 正常
                    this.setState({
                        serverStatus: true
                    })
                } else {
                    // 服务不可用
                    this.setState({
                        serverStatus: false
                    })
                }
            }

        })
    }

    componentDidUpdate(prevProps: any, prevState: any) {

    }

    componentWillUnmount() {

    }



    render() {
        const { system, devices, title, url, serverStatus, defaultPosition } = this.state;

        return (
            <Draggable handle="strong"
            defaultPosition={defaultPosition || { x: 0, y: 0 }}
                onDrag={_savePosition}
                onStop={_savePosition}
            >
                <Card
                    title={<strong className="cursor">
                        <p>{title}</p>
                    </strong>}
                    bordered={false}
                    style={{
                        width: 480,
                        position: 'fixed',
                        // left: 120, top: '10vh', 
                        // height: '80vh' 
                    }}
                    bodyStyle={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start'
                    }}
                    extra={<CloseOutlined key="edit"
                        onClick={async () => {
                            window.postMessage({
                                data: {
                                    event: 'close-output',
                                    data: {
                                        type: 'setup'
                                    }
                                }
                            })
                        }}
                    />}
                // actions={actions}
                >

                    <Space.Compact block direction="vertical">
                        <p>{'URL'}</p>

                        <Space.Compact block  >
                            <Input
                                status={serverStatus ? '' : "error"}
                                placeholder="URL" value={url}
                                onChange={(e) => {
                                    this.setState({
                                        url: e.target.value
                                    })
                                }}
                                style={{
                                    width: 240
                                }}
                            />
                            <Button
                                onClick={async () => {
                                    let res = await window.electron.comfyApi('updateUrl', {
                                        url: `http://${url}`
                                    });
                                    this.setState({
                                        serverStatus: !!res
                                    })
                                    console.log('updateUrl', res)
                                }}
                            >{serverStatus ? i18n.t('refreshUrl') : i18n.t('serverError')}</Button>
                        </Space.Compact>
                    </Space.Compact>
                    <br />


                    <Space.Compact block direction="vertical">
                        <p>{i18n.t('devices')}</p>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            {
                                Array.from(devices || [], (device: any, i: number) => {
                                    return <div key={i}>
                                        <Tag >{device['type']}</Tag>
                                        <Tag>{i18n.t('vram_free')}: {Math.round(100 * (device['vram_free']) / device['vram_total'])}%</Tag>
                                        <Tag>{i18n.t('vram_total')}: {device['vram_total']}</Tag>
                                        <Tag >{device['name']}</Tag>
                                    </div>
                                })
                            }


                        </div>
                    </Space.Compact >
                    <br />


                    <Space.Compact block direction="vertical">
                        <p>Python</p>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                flexWrap: 'wrap'
                            }}
                        >
                            {
                                <Tag>{system?.python_version}</Tag>
                            }</div>
                    </Space.Compact>


                </Card>

            </Draggable>
        );
    }
}

export default App