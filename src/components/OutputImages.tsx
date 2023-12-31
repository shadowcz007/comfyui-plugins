import React, { useState } from 'react';
import { Avatar, Space, Image, Dropdown, Button, Card } from 'antd';

import { CloseOutlined, DownloadOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";
import { savePosition, getPosition, onCardFocus } from './Common'

declare const window: Window &
  typeof globalThis & {
    electron: any,
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


class App extends React.Component {
  _key: string;
  _defaultPosition: any;
  constructor(props: any) {
    super(props);

    const { name, data, title, id, from } = this.props.data;

    this.state = {
      name,
      images: data,
      title,
      id,
      from,
      view: 0
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
        title, id,
        current: 0
      })
      this._key = `_output_images_position_${id ? id : ''}`
    }
  }

  componentWillUnmount() {

  }

  _savePosition(e: any) {
    savePosition(this._key, e)
  }

  _create() {
    const {
      name,
      id,
      from
    } = this.state;

    this.props.callback({
      cmd: 'runPrompt',
      data: {
        name,
        data: {
          name,
          id,
          from
        }
      }
    })
  }

  _changeView() {
    let view = this.state.view;
    view++;
    if (view > 2) view = 0;
    this.setState({
      view
    })
  }

  _convertImageToBase64 = (url: string) => {
    return new Promise((res, rej) => {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          res(reader.result);
        }
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    })

  }

  async _onDownload(e: any) {
    console.log(e, this.state.images[this.state.current])
    const imgurl = this.state.images[this.state.current]
    if (imgurl) {
      this._save(imgurl)
    }
  }

  async _save(imgurl: string) {
    const input = window.electron.global('input');
    console.log(window.electron.global('input'))
    // 读取为base64
    let base64 = await this._convertImageToBase64(imgurl);
    let id = window.electron.hash({ input, base64 })
    window.electron.saveAs(`${this.state.name}_${this.state.current}_${id}.png`, { base64 });
  }

  async _contextMenu(e: any, imgurl: string) {
    if (e.key === 'saveAs') {
      this._save(imgurl)
    }
  }

  render() {
    const { images, name, title, id, view } = this.state;

    let cardWidth = 480, imageWidth: any = 200, displayCount = 4;
    if (view == 0) {
      cardWidth = 480;
      imageWidth = 200;
      displayCount = 4;
    } else if (view === 1) {
      cardWidth = 360;
      imageWidth = 100;
      displayCount = 9;
    } else if (view === 2) {
      cardWidth = 560;
      imageWidth = '100%';
      displayCount = 1;
    }

    const contextMenuIitems = [
      {
        label: i18n.t('save as'),
        key: 'saveAs',

      },
      // {
      //   label: i18n.t('select'),
      //   key: 'select',
      // }
    ];

    return (
      <Draggable handle="strong"
        defaultPosition={this._defaultPosition || { x: 0, y: 0 }}
        defaultClassName={`react-draggable ${this._key}`}
        onDrag={(e: any) => this._savePosition(e)}
        onStop={(e: any) => this._savePosition(e)}
        onMouseDown={() => onCardFocus(this._key)}
      >


        <Card
          title={<strong className="cursor">
            <p>{title} {name} </p>
            <p>{i18n.t('A total of')} {images.length}</p>
          </strong>}
          bordered={false}
          style={{
            width: cardWidth,
            position: 'fixed',
            // left: 120, top: '10vh', 
            maxHeight: '80vh'
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
          actions={[
            <Button
              onClick={() => this._changeView()}
            >{i18n.t('change view')}</Button>,
            // <Button
            //   type="primary"
            //   onClick={() => this._create()}
            // >{i18n.t('Generate a replica')}</Button>
          ]}
        >

          <Image.PreviewGroup
            preview={{
              toolbarRender: (
                _,
                {
                  transform: { scale },
                  actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn },
                },
              ) => (
                <Space size={12} className="toolbar-wrapper">
                  <DownloadOutlined
                    onClick={(e) => this._onDownload(e)} />
                </Space>
              ),
              onChange: (current, prev) => {
                console.log(`current index: ${current}, prev index: ${prev}`)
                this.setState({ current })
              },
            }}
          >

            {
              Array.from(images, (imgurl: string, index: number) =>
                <Dropdown
                  menu={{ items: contextMenuIitems, onClick: (e: any) => this._contextMenu(e, imgurl) }}
                  trigger={['contextMenu']}>
                  <div>
                    <Image
                      key={index}
                      style={{
                        display: index >= displayCount ? 'none' : 'block',
                        maxHeight: 600
                      }}
                      width={imageWidth}
                      src={imgurl}
                      onClick={() => this.setState({ current: index })}
                    />
                  </div>
                </Dropdown>)
            }


          </Image.PreviewGroup>

          {/* <Image width={200} src={imgurl} /> */}
        </Card>

      </Draggable>
    );
  }
}

export default App