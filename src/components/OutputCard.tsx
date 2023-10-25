import React, { useState } from 'react';
import { Avatar, List, Image, Space, Card } from 'antd';

import { CloseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import i18n from "i18next";


const App: any = (props: any) => {
  const { name, imgurl, callback, actions } = props;

  return (
    <Draggable handle="strong" >
      <Card
        title={<strong className="cursor">{name}</strong>}
        bordered={false}
        style={{
          width: 200,
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

        <Image width={200} src={imgurl} />
      </Card>
    </Draggable>
  );
};

export default App;