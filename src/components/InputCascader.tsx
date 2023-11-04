import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Input, Space, Tag, Cascader, Tooltip } from 'antd';
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

const options = [
    
    {
        value: 'human',
        label: '人物',
        children: [
            {
                value: 'emotion',
                label: '表情',
                children: [{
                    "label": "生气的",
                    "value": "Angry"
                },
                {
                    "label": "青筋凸起",
                    "value": "Anger vein"
                },
                {
                    "label": "恼火",
                    "value": "Annoyed"
                },
                {
                    "label": "咬牙",
                    "value": "Clenched teeth"
                },
                {
                    "label": "脸红",
                    "value": "Blush"
                },
                {
                    "label": "2D脸红",
                    "value": "Blush stickers"
                },
                {
                    "label": "尴尬的",
                    "value": "Embarrassed"
                },
                {
                    "label": "无聊的",
                    "value": "Bored"
                },
                {
                    "label": "闭上眼睛",
                    "value": "Closed eyes"
                },
                {
                    "label": "困惑的",
                    "value": "Confused"
                },
                {
                    "label": "厌恶",
                    "value": "Disgust"
                },
                {
                    "label": "喝醉了",
                    "value": "Drunk"
                },
                {
                    "label": "慌张",
                    "value": "Flustered"
                },
                {
                    "label": "扭曲的脸",
                    "value": "Grimace"
                },
                {
                    "label": "快乐的",
                    "value": "Happy"
                },
                {
                    "label": "紧张的",
                    "value": "Nervous"
                },
                {
                    "label": "流鼻血",
                    "value": "Nosebleed"
                },
                {
                    "label": "一只眼睛闭上",
                    "value": "One eye closed"
                },
                {
                    "label": "张开嘴",
                    "value": "Open mouth"
                },
                {
                    "label": "分开的嘴唇",
                    "value": "Parted lips"
                },
                {
                    "label": "疼痛",
                    "value": "Pain face"
                },
                {
                    "label": "撅嘴",
                    "value": "Pout"
                },
                {
                    "label": "扬眉",
                    "value": "Raised eyebrow"
                },
                {
                    "label": "翻白眼",
                    "value": "Rolling eyes"
                },
                {
                    "label": "伤心",
                    "value": "Sad"
                },
                {
                    "label": "皱眉",
                    "value": "Frown"
                },
                {
                    "label": "忧郁",
                    "value": "Gloom"
                },
                {
                    "label": "眼泪",
                    "value": "Tears"
                },
                {
                    "label": "惊恐的",
                    "value": "Scared"
                },
                {
                    "label": "担心",
                    "value": "Worried"
                },
                {
                    "label": "严肃的",
                    "value": "Serious"
                },
                {
                    "label": "困",
                    "value": "Sleepy"
                },
                {
                    "label": "思考中",
                    "value": "Thinking"
                },
                {
                    "label": "程度较啊嘿颜更轻",
                    "value": "Fucked silly"
                },
                {
                    "label": "调皮的脸",
                    "value": "Naughty face"
                },
                {
                    "label": "疯狂的笑容",
                    "value": "Crazy smile"
                },
                {
                    "label": "邪恶的笑容",
                    "value": "Evil smile"
                },
                {
                    "label": "邪恶的露齿笑",
                    "value": "Evil grin"
                },
                {
                    "label": "浅笑",
                    "value": "Light smile"
                },
                {
                    "label": "得意脸",
                    "value": "Smug"
                },
                {
                    "label": "得意脸",
                    "value": "Doyagao"
                },
                {
                    "label": "单侧嘴角上扬",
                    "value": "Smirk"
                },
                {
                    "label": "惊讶",
                    "value": "Surprised"
                },
                {
                    "label": "抿嘴 波浪形嘴",
                    "value": "Wavy mouth"
                },
                {
                    "label": "畏缩",
                    "value": "wince"
                },
                {
                    "label": "微笑",
                    "value": "smile"
                },
                {
                    "label": "咧嘴一笑",
                    "value": "grin"
                },
                {
                    "label": "面无表情",
                    "value": "expressionless"
                },
                {
                    "label": "哭泣",
                    "value": "crying"
                },
                {
                    "label": "吃惊",
                    "value": "startled"
                },
                {
                    "label": "流口水",
                    "value": "drooling"
                },
                {
                    "label": "皱眉",
                    "value": "furrowed brow"
                },
                {
                    "label": "笑",
                    "value": "laughing"
                },
                {
                    "label": "诱人的微笑",
                    "value": "seductive smile"
                },
                {
                    "label": "轻皱眉",
                    "value": "light frown"
                },
                {
                    "label": "害羞的",
                    "value": "shy"
                }
                ],
            },
        ],
    },
];


declare const window: Window &
    typeof globalThis & {
        electron: any,
    }

class App extends Component {

    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = {
            opts: []
        };
    }

    componentDidMount() {
        this._init()
    }

    async _init() {
        let { filePath, data } = await window.electron.readPath('cascaders');
        let opts = options;
        if (data) {
            opts=[...opts,...data]
            // opts.push(data);
        }
        console.log('_init',opts)
        this.setState({
            opts
        })
    }

    filter(inputValue: string, path: any) {
        return path.some(
            (option: { label: string; }) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
        );
    }

    onChange(items: any) {
        let tags = [];
        for (const item of items) {
            let m = [...item];
            tags.push(m.pop())
        }
        this.props.onChange && this.props.onChange({
            currentTarget: {
                value: tags
            }
        });
    }
    render() {

        return (
            <Cascader
                options={this.state.opts}
                onChange={(e) => this.onChange(e)}
                placeholder="Please select"
                multiple
                maxTagCount="responsive"
                showCheckedStrategy={Cascader.SHOW_CHILD}

                showSearch={{ filter: this.filter }}
                onSearch={(value) => console.log(value)}
            />
        );
    }
}

export default App;

