import React, { Component } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Input, Space, Tag, theme, Tooltip } from 'antd';
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

    render() {
        const { tags, inputVisible, inputValue, editInputIndex, editInputValue } = this.state;
        return (
            <Space size={[0, 8]} wrap style={{width: '100%'}}>
                {tags.map((tag: any, index: number) => {
                    if (editInputIndex === index) {
                        return (
                            <Input
                                ref={this.editInputRef}
                                key={tag}
                                size="large"
                                value={editInputValue}
                                onChange={this.handleEditInputChange}
                                onBlur={this.handleEditInputConfirm}
                                onPressEnter={this.handleEditInputConfirm}
                            />
                        );
                    }
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                        <Tag
                            key={tag}
                            closable={index >= 0}
                            style={{ userSelect: 'none' }}
                            onClose={() => this.handleClose(tag)}
                        >
                            <span
                                onDoubleClick={(e) => {
                                    if (index >= 0) {
                                        this.setState({ editInputIndex: index, editInputValue: tag });
                                        e.preventDefault();
                                    }
                                }}
                            >
                                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                            </span>
                        </Tag>
                    );
                    return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                            {tagElem}
                        </Tooltip>
                    ) : (
                        tagElem
                    );
                })}
                {inputVisible ? (
                    <Input
                        ref={this.inputRef}
                        type="text"
                        size="large"
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                ) : (
                    <Tag icon={<PlusOutlined />} onClick={this.showInput}>
                        {i18n.t('New Tag')}
                    </Tag>
                )}
            </Space>
        );
    }
}

export default App;

