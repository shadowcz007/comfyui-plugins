import React, { useState } from 'react';
import { Avatar, List, Image, Space, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";
import { savePosition, getPosition, onCardFocus } from './Common'




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
  _key: string;
  _defaultPosition: any;
  constructor(props: any) {
    super(props);

    const { name, data, title, id } = this.props.data;

    this.state = {
      name,
      images: data,
      title,
      id
    }
    this._key = `_output_images_position_${id ? id : ''}`
    this._defaultPosition = getPosition(this._key)

  }

  componentDidMount() {
    // this.setupConnection();
    onCardFocus(this._key)
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.data != prevProps.data) {
      const { name, data, title, id } = this.props.data;
      this.setState({
        name,
        images: data,
        title, id
      })
      this._key = `_output_images_position_${id ? id : ''}`
    }
  }

  componentWillUnmount() {

  }

  _savePosition(e: any) {
    savePosition(this._key, e)
  }

  render() {
    const { images, name, title, id } = this.state;

    return (
      <Draggable handle="strong"
        defaultPosition={this._defaultPosition || { x: 0, y: 0 }}
        defaultClassName={`react-draggable ${this._key}`}
        onDrag={(e:any)=>this._savePosition(e)}
        onStop={(e:any)=>this._savePosition(e)}
        onMouseDown={() => onCardFocus(this._key)}
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