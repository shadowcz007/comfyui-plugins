import React, { useState } from 'react';
import { Input, List, Image, Button, Space, Typography, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";

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

    this.state = {
      data: this.props.data?.data,
      name: this.props.data?.name
    }


  }

  componentDidMount() {
    // this.setupConnection();
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.data != prevProps.data) {

      this.setState({
        data: this.props.data?.data,
        name: this.props.data?.name
      })
    }
  }

  componentWillUnmount() {

  }

  render() {

    return (
      <Draggable handle="strong" >
        <Card
          title={<strong className="cursor">
            <p>{'title'}</p>
            <p>{'name'}</p>
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
            justifyContent: 'center',
            alignItems: 'center'
          }}
          extra={<CloseOutlined key="edit"
            onClick={async () => {
              window.postMessage({
                data: {
                  event: 'close-output',
                  data: {
                    name,
                    type: 'images',

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
                    <Text >{item.label}</Text>
                    <Input.TextArea rows={4}
                      value={item.value}
                      onChange={(e: any) => {
                        console.log(e.currentTarget.value)

                        let newData = Array.from(this.state.data, (d: any) => {
                          if (d.id === item.id) {
                            d.value = e.currentTarget.value;
                          }
                          return d
                        })

                        this.setState({
                          data: newData
                        })
                      }}
                    />
                  </>)
                }
              }
              return div
            })()
          }

          <Button onClick={() => {
            console.log('###', this.state.data)
            if (this.props.run) {
              this.props.run(this.state.name, this.state.data)
            }
          }}>{i18n.t('run')}</Button>
        </Card>

      </Draggable>
    );
  }
}

export default App