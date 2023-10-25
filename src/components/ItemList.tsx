import React, { useState } from 'react';
import { Avatar, List, Radio, Space, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";


const pluginCard = (data: any, key: any, callback: any) => (
  <Card
    size="small"
    title={data.name}
    style={{ width: 300, backgroundColor: '#eee' }}
    key={key}


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
      avatar={<Avatar src="https://xsgames.co/randomusers/avatar.php?g=pixel" />}
      title={<PlayCircleOutlined key="edit"
        onClick={async () => {
          if (callback) {
            // console.log(name)
            callback({
              cmd: 'run',
              data: { name: data.name }
            })
          }
        }}
      />}
      description={data.url}
    />
  </Card>
);



const App: any = (props: any) => {
  const { items, callback, actions } = props;
  const _dragRef: any = React.useRef();
  const defaultPosition = JSON.parse(localStorage.getItem('_workflow_plugin_position') || JSON.stringify({
    x: 0, y: 0
  }))
  const savePosition = (e: any) => {
    // console.log(_dragRef.current.state)
    const { x, y } = _dragRef.current.state;
    localStorage.setItem('_workflow_plugin_position', JSON.stringify({
      x, y
    }))
  }

  return (
    <Draggable
      ref={_dragRef}
      // 初始位置
      defaultPosition={defaultPosition || { x: 0, y: 0 }}

      handle="strong"
      onDrag={savePosition}
      onStop={savePosition}

    >
      <Card
        title={<strong className="cursor">{i18n.t("Workflow Plugin")}</strong>}
        bordered={false}
        style={{
          width: 360,
          // position: 'fixed', left: 120, top: '10vh', 
          // height: '80vh' 
        }}
        extra={<CloseOutlined key="edit"
          onClick={async () => {
            if (callback) {
              // console.log(name)
              callback({
                cmd: 'display',
                data: { show: false }
              })
            }
          }}
        />}

        actions={actions}

      >

        <List
          pagination={{ position: 'top', align: 'start' }}
          dataSource={items}
          renderItem={(item: any, index) => (
            <List.Item>
              {pluginCard(item, index, callback)}
            </List.Item>
          )}
        />
      </Card>
    </Draggable>
  );
};

export default App;