import React, { useState } from 'react';
import { Input, List, Image, Button, Space, Typography, Card, Divider } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";

import InputTag from './InputTag'


const { Text } = Typography

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

    this.state = this._init()

  }

  _init() {
    const name = this.props.data?.name
    const defaultPosition = JSON.parse(localStorage.getItem(`_${name}_inputs_position`) || JSON.stringify({
      x: 0, y: 0
    }))
    return {
      name,
      defaultPosition,
      data: this.props.data?.data
    }
  }

  _savePosition(e: any) {
    const { x, y } = e.target.getBoundingClientRect();
    localStorage.setItem(`_${this.state.name}_inputs_position`, JSON.stringify({
      x, y
    }))

  }

  _updateData(id: string, value: any) {
    let newData = Array.from(this.state.data, (d: any) => {
      if (d.id === id) {
        d.value = value;
      }
      return d
    })
    this.setState({
      data: newData
    })
  }

  componentDidMount() {
    // this.setupConnection();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.data != prevProps.data) {
      const d: any = this._init()
      this.setState(d);
    }
  }

  componentWillUnmount() {

  }



  render() {

    return (
      <Draggable handle="strong"
        defaultClassName='inputs_ui'
        defaultPosition={this.state.defaultPosition || { x: 0, y: 0 }}
        onDrag={(e) => this._savePosition(e)}
        onStop={(e) => this._savePosition(e)}
      >
        <Card
          title={<strong className="cursor">
            <p>{this.state.name}</p>
            <p>{'#inputs'}</p>
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
            alignItems: 'center'
          }}
          extra={<CloseOutlined key="edit"
            onClick={async () => {
              window.postMessage({
                data: {
                  event: 'close-input',
                  data: {
                    name
                  }
                }
              })
            }}
          />}
        // actions={actions}
        >
          {
            this.state.data?.length > 0 && (() => {
              let div = [];
              for (const item of this.state.data) {
                if (item.type === 'string') {
                  div.push(<>
                    <Text style={{ marginBottom: 12 }}>{item.label}</Text>
                    <Input.TextArea rows={4}
                      value={item.value}
                      className='scrollbar'
                      style={{ marginBottom: 12 }}
                      onChange={(e: any) => {
                        this._updateData(item.id, e.currentTarget.value);
                      }}
                    />
                    <Divider />
                  </>)
                };

                if (item.type === 'tag') {
                  div.push(<>
                    <Text style={{ marginBottom: 12 }}>{item.label}</Text>
                    <InputTag
                      value={item.value}
                      style={{ marginBottom: 12 }}
                      onChange={(e: any) => {
                        this._updateData(item.id, e.currentTarget.value);
                      }}
                    />
                    <Divider />
                  </>)
                }

              }
              return div
            })()
          }

          <Button
            type="primary"
            onClick={() => {
              console.log('###', this.state.data)
              if (this.props.run) {
                this.props.callback({
                  cmd: 'run',
                  data: {
                    name: this.state.name, data: this.state.data
                  }
                })
              }
            }}>{i18n.t('run')}</Button>
        </Card>

      </Draggable>
    );
  }
}

export default App