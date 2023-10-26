import * as React from "react";

import { Avatar, List, Radio, Space, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import i18n from "i18next";



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

class App extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {
            data: this.props.data,
            play: false,
            disabled: false
        }
        // console.log(this.props.data)
        window.addEventListener('message', (res: any) => {
            console.log('message::status:done', res.data)
            const { cmd, data } = res.data;
            if (cmd === 'status:done') {
                if (data.name === this.state.data.name) {
                    this.setState({
                        play: false
                    })
                }
            } else if (cmd === 'status:switch') {
                if (data.id !== this.state.data.id) {
                    this.setState({
                        play: false
                    })
                }
            } else if (cmd == 'status:close') {
                if (data.id === this.state.data.id) {
                    this.setState({
                        play: false
                    })
                }
            }
        })
    }

    componentDidMount() {
        // this.setupConnection();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        // console.log(this.props.data.avatar,this.state.data.avatar)
        if (
            this.props.data !== this.state.data || this.props.data.avatar != this.state.data.avatar
        ) {
            let json: any = { data: this.props.data, play: false };

            // this.destroyConnection();
            // this.setupConnection();
            if (this.props.data.disabled != undefined) {
                json.disabled = this.props.data.disabled;
            }

            this.setState(json)
        }
    }

    componentWillUnmount() {
        // this.destroyConnection();
    }

    render() {
        const data = this.state.data, play = this.state.play;
        const callback = this.props.callback;
        // console.log(data.avatar)
        return (
            <Card
                size="small"
                title={data.name}
                style={{ width: 300, backgroundColor: '#eee' }}

                // cover={
                //     <img
                //         alt="example"
                //         src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                //     />
                // } 
                extra={
                    <DeleteOutlined key="edit"
                        onClick={async () => {
                            if (callback) {
                                // console.log(name)
                                callback({
                                    cmd: 'remove',
                                    data: { name: data.name }
                                })
                            }
                        }}
                    />}
            // actions={[

            // <CloseOutlined key="edit"
            //   onClick={async () => {
            //     if (callback) {
            //       // console.log(name)
            //       callback({
            //         cmd: 'remove',
            //         data: { name }
            //       })
            //     }
            //   }}
            // />,

            // ]}
            >
                <Card.Meta
                    avatar={<Avatar
                        size={98}
                        src={data.avatar || "https://xsgames.co/randomusers/avatar.php?g=pixel"}
                    />}
                    title={play ? <LoadingOutlined
                        onClick={() => {
                            if (callback) {
                                callback({
                                    cmd: 'interrupt',
                                    data: { name: data.name, ...data }
                                })
                                this.setState({ play: false })
                            }
                        }}
                    /> : <PlayCircleOutlined key="edit"
                        disabled={this.state.disabled}
                        onClick={async () => {
                            if (callback) {
                                // console.log(name)
                                callback({
                                    cmd: 'run',
                                    data: { name: data.name, ...data }
                                });
                                this.setState({ play: true })
                            }
                        }}
                    />}
                    description={data.url || data.type}
                />
            </Card>
        );
    }
}

export default App;