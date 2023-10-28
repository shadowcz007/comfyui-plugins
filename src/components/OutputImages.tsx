import React, { useState } from 'react';
import { Avatar, List, Image, Space, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";
import { savePosition, getPosition,onCardFocus } from './Common'


const key=`_output_images_position`
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

    const { name, data, title, id } = this.props.data;

    this.state = {
      name,
      images: data,
      title,
      id
    }


  }

  componentDidMount() {
    // this.setupConnection();
    onCardFocus(key)
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.data != prevProps.data) {
      const { name, data, title, id } = this.props.data;
      this.setState({
        name,
        images: data,
        title, id
      })
    }
  }

  componentWillUnmount() {

  }

  _savePosition(e: any) {
    savePosition(key, e)
  }

  render() {
    const { images, name, title, id } = this.state;

    return (
      <Draggable handle="strong"

        defaultPosition={defaultPosition || { x: 0, y: 0 }}
        defaultClassName={`react-draggable ${key}`}
        onDrag={this._savePosition}
        onStop={this._savePosition}
        onMouseDown={()=>onCardFocus(key)}
      >
        <Card
          title={<strong className="cursor">
            <p>{title}</p>
            <p>{name} {images.length}</p>
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
                    id
                  }
                }
              })
            }}
          />}
        // actions={actions}
        >
          <Image.PreviewGroup
            preview={{
              onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
            }}
          >
            {
              Array.from(images, (imgurl: string, index: number) =>
                <Image
                  key={index}
                  style={{
                    display: index > 3 ? 'none' : 'block'
                  }}
                  width={200}
                  src={imgurl} />)
            }

          </Image.PreviewGroup>
          {/* <Image width={200} src={imgurl} /> */}
        </Card>

      </Draggable>
    );
  }
}

export default App