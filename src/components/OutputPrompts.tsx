import React, { useState } from 'react';
import { Avatar, List, Image, Typography, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";
import { savePosition, getPosition,onCardFocus } from './Common'


const { Paragraph } = Typography;

const key = `_output_prompts_position`
const defaultPosition = getPosition(key)


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

    const { name, title, data, id } = this.props.data;

    this.state = {
      name,
      prompts: data,
      id
    }


  }

  componentDidMount() {
    onCardFocus(key)
  }

  componentDidUpdate(prevProps: any, prevState: any) {

  }

  componentWillUnmount() {

  }

  _savePosition(e: any) {
    savePosition(key, e)
  }

  render() {
    const { prompts, name, title, id } = this.state;

    return (
      <Draggable handle="strong"
        defaultPosition={defaultPosition || { x: 0, y: 0 }}
        defaultClassName={`react-draggable ${key}`}
        onDrag={(e:any)=>this._savePosition(e)}
        onStop={(e:any)=>this._savePosition(e)}
        onMouseDown={()=>onCardFocus(key)}
      >
        <Card
          title={<strong className="cursor">{name} {title}</strong>}
          bordered={false}
          style={{
            width: 480,
            position: 'fixed',
            // left: 120, top: '10vh', 

          }}
          bodyStyle={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            overflowY: 'scroll',
            height: '60vh'
          }}
          extra={<CloseOutlined key="edit"
            onClick={async () => {
              window.postMessage({
                data: {
                  event: 'close-output',
                  data: {
                    name,
                    type: 'prompts',
                    id
                  }
                }
              })
            }}
          />}
        // actions={actions}
        >
          {
            Array.from(prompts, (prompt: string, index: number) =>
              <Paragraph copyable={{ tooltips: false }} key={index}>{prompt}</Paragraph>
            )
          }

        </Card>

      </Draggable>
    );
  }
}

export default App