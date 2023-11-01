import React, { Component } from 'react';
import { PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Space, Tag, Typography, Button, Card } from 'antd';
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

declare const window: Window &
    typeof globalThis & {
        electron: any,
    }



class App extends Component {
    inputRef: any;
    editInputRef: any;
    constructor(props: {} | Readonly<{}>) {
        super(props);

        let tags = this.props.value || [];
        if (typeof (tags) === 'string') {
            tags = this.props.value.split('\n');
            tags = tags.filter((t: string) => t.trim());
            if (tags.length <= 1) {
                tags = this.props.value.split(',');
                tags = tags.filter((t: string) => t.trim());
            }
        };

        this.state = {
            tags,
            inputVisible: false,
            inputValue: '',
            editInputIndex: -1,
            editInputValue: '',
        };
        this.inputRef = React.createRef();
        this.editInputRef = React.createRef();
    }

    componentDidMount() {
        if (this.state.inputVisible) {
            this.inputRef.current?.focus();
        }
        this.editInputRef.current?.focus();
    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.value != this.state.tags) {
            let tags = this.props.value || [];
            if (typeof (tags) === 'string') {
                tags = this.props.value.split('\n');
                tags = tags.filter((t: string) => t.trim());
                if (tags.length <= 1) {
                    tags = this.props.value.split(',');
                    tags = tags.filter((t: string) => t.trim());
                }
            };
            this.setState({
                tags
            })
        }
    }

    handleClose = (removedTag: any) => {
        const { tags } = this.state;
        const newTags = tags.filter((tag: any) => tag !== removedTag);
        this.setState({ tags: newTags });
        this.props.onChange && this.props.onChange({
            currentTarget: {
                value: newTags
            }
        });
    };

    showInput = () => {
        this.setState({ inputVisible: true });
    };

    pasteBlock = () => {
        const text = window.electron.pasteText();
        const ts = Array.from(text.split('\n').filter((t: any) => t), (t: any) => t.trim());
        console.log(ts)
        if (ts.length > 0) {
            const newTags = [
                ...this.state.tags,
                ...ts
            ]
            this.setState({
                tags: newTags
            });

            this.props.onChange && this.props.onChange({
                currentTarget: {
                    value: newTags
                }
            });
        }
    }

    handleInputChange = (e: { target: { value: any; }; }) => {
        this.setState({ inputValue: e.target.value });
    };

    handleInputConfirm = () => {
        const { inputValue, tags } = this.state;
        if (inputValue && !tags.includes(inputValue)) {
            this.setState({ tags: [...tags, inputValue] });

            this.props.onChange && this.props.onChange({
                currentTarget: {
                    value: [...tags, inputValue]
                }
            });

        }
        this.setState({ inputVisible: false, inputValue: '' });
    };

    handleEditInputChange = (e: { target: { value: any; }; }) => {
        this.setState({ editInputValue: e.target.value });
    };

    handleEditInputConfirm = () => {
        const { editInputIndex, editInputValue, tags } = this.state;
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;
        this.setState({
            tags: newTags,
            editInputIndex: -1,
            editInputValue: '',
        });


        this.props.onChange && this.props.onChange({
            currentTarget: {
                value: newTags
            }
        });

    };

    clear() {
        this.setState({
            tags: []
        });

        this.props.onChange && this.props.onChange({
            currentTarget: {
                value: []
            }
        });
    }

    render() {
        const { tags, inputVisible, inputValue, editInputIndex, editInputValue } = this.state;
        return (
            <Space size={[0, 8]}
                wrap
                className='scrollbar'
                style={{
                    width: '100%',
                    maxHeight: 560,
                    overflowY: 'scroll',
                    paddingBottom: 36
                }}>
                {tags.map((tag: any, index: number) => {
                    if (editInputIndex === index) {
                        return (
                            <Input.TextArea
                                ref={this.editInputRef}
                                key={tag}
                                autoSize={{ minRows: 3, maxRows: 5 }}
                                value={editInputValue}
                                onChange={this.handleEditInputChange}
                                onBlur={this.handleEditInputConfirm}
                                style={{
                                    width: 400, border: 'none'
                                }}
                            // onPressEnter={this.handleEditInputConfirm}
                            />
                        );
                    }
                    // const isLongTag = tag.length > 20;

                    const tagElem = (
                        <div
                            key={tag}

                            style={{ userSelect: 'none', marginBottom: 8 }}
                            onDoubleClick={(e) => {
                                if (index >= 0) {
                                    this.setState({ editInputIndex: index, editInputValue: tag });
                                    e.preventDefault();
                                }
                            }}
                        >
                            {tag}  <CloseOutlined onClick={() => this.handleClose(tag)} />
                        </div>
                    );
                    return tagElem;
                })}
                {inputVisible ? (
                    <Input.TextArea
                        ref={this.inputRef}
                        value={inputValue}
                        autoSize={{ minRows: 3, maxRows: 5 }}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                        style={{
                            width: 400
                        }}
                    />
                ) : (
                    <>
                        <Tag icon={<PlusOutlined />} onClick={this.showInput}>
                            {i18n.t('New Block')}
                        </Tag>
                        <Tag icon={<PlusOutlined />} onClick={this.pasteBlock}>
                            {i18n.t('Paste Block')}
                        </Tag>
                        {
                            this.state.tags.length > 0 && <Tag icon={<DeleteOutlined />} onClick={() => this.clear()}>
                                {i18n.t('Clear')}
                            </Tag>
                        }
                    </>
                )}
            </Space>
        );
    }
}

export default App;

